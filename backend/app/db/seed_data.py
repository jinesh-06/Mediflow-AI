from datetime import datetime, timedelta
import random
from typing import Dict, List, Any
from app.models.healthcare import State, District, Medicine, PHC, Inventory, Bed, Personnel, PatientFootfall

# Fixed seed for reproducibility
random.seed(42)

def generate_seed_data() -> Dict[str, Any]:
    states = [
        State(id="STATE-TN", name="Tamil Nadu", code="TN", region="South"),
        State(id="STATE-KA", name="Karnataka", code="KA", region="South"),
        State(id="STATE-MH", name="Maharashtra", code="MH", region="West"),
        State(id="STATE-WB", name="West Bengal", code="WB", region="East"),
    ]

    districts = [
        # Tamil Nadu
        District(id="DIST-01", name="Chennai Central (District A)", state_id="STATE-TN"),
        District(id="DIST-02", name="Kanchipuram Rural (District B)", state_id="STATE-TN"),
        # Karnataka
        District(id="DIST-03", name="Bengaluru Urban", state_id="STATE-KA"),
        District(id="DIST-04", name="Mysuru", state_id="STATE-KA"),
        # Maharashtra
        District(id="DIST-05", name="Pune District", state_id="STATE-MH"),
        District(id="DIST-06", name="Nashik Rural", state_id="STATE-MH"),
        # West Bengal
        District(id="DIST-07", name="Kolkata North", state_id="STATE-WB"),
        District(id="DIST-08", name="Howrah", state_id="STATE-WB"),
    ]

    medicines = [
        Medicine(id="MED-ORS", name="ORS (Oral Rehydration Salts)", category="Fluid Replacement", unit="Packets", criticality="CRITICAL"),
        Medicine(id="MED-PCM", name="Paracetamol 500mg", category="Antipyretic", unit="Tablets", criticality="HIGH"),
        Medicine(id="MED-AMX", name="Amoxicillin 500mg", category="Antibiotic", unit="Capsules", criticality="HIGH"),
        Medicine(id="MED-AZI", name="Azithromycin 500mg", category="Antibiotic", unit="Tablets", criticality="MEDIUM"),
        Medicine(id="MED-INS", name="Human Insulin 40IU", category="Endocrine", unit="Vials", criticality="CRITICAL"),
        Medicine(id="MED-ART", name="Artesunate Injection", category="Antimalarial", unit="Vials", criticality="CRITICAL"),
    ]

    # Generate 48 PHCs (6 per district)
    # District coords base
    district_coords = {
        "DIST-01": (13.0827, 80.2707),  # Chennai
        "DIST-02": (12.8342, 79.7036),  # Kanchipuram
        "DIST-03": (12.9716, 77.5946),  # Bengaluru
        "DIST-04": (12.2958, 76.6394),  # Mysuru
        "DIST-05": (18.5204, 73.8567),  # Pune
        "DIST-06": (19.9975, 73.7898),  # Nashik
        "DIST-07": (22.5726, 88.3639),  # Kolkata
        "DIST-08": (22.5958, 88.2636),  # Howrah
    }

    phcs: List[PHC] = []
    inventories: List[Inventory] = []
    beds: List[Bed] = []
    personnel_list: List[Personnel] = []
    footfalls: List[PatientFootfall] = []

    phc_counter = 1

    for dist in districts:
        base_lat, base_lng = district_coords[dist.id]
        state_id = dist.state_id

        for i in range(1, 7):
            phc_num_str = f"{phc_counter:03d}"
            phc_id = f"PHC-{phc_num_str}"
            
            # Specific Golden Path setting: PHC-021 in DIST-01
            if phc_counter == 21:
                phc_id = "PHC-021"
                phc_name = "Tondiarpet Urban PHC (PHC-021)"
                lat = 13.1250
                lng = 80.2910
            elif dist.id == "DIST-02" and i == 1:
                # District B source hub
                phc_name = f"{dist.name.split()[0]} Regional Warehouse PHC"
                lat = base_lat + 0.02
                lng = base_lng - 0.02
            else:
                phc_name = f"{dist.name.split()[0]} Sector-{i} PHC"
                lat = round(base_lat + random.uniform(-0.15, 0.15), 4)
                lng = round(base_lng + random.uniform(-0.15, 0.15), 4)

            phcs.append(PHC(
                id=phc_id,
                name=phc_name,
                district_id=dist.id,
                state_id=state_id,
                latitude=lat,
                longitude=lng,
                status="OPERATIONAL",
                contact_number=f"+91 44 28{random.randint(100000, 999999)}",
                facility_type="PHC" if i > 1 else "CHC"
            ))

            # Beds
            total_b = 20 if i > 1 else 40
            if phc_id == "PHC-021":
                # 72% occupancy baseline as specified in Section 20
                occ_b = int(total_b * 0.72)
                res_b = 2
                maint_b = 1
            else:
                occ_b = random.randint(int(total_b * 0.5), int(total_b * 0.8))
                res_b = random.randint(1, 3)
                maint_b = random.randint(0, 2)
            avail_b = max(0, total_b - occ_b - res_b - maint_b)

            beds.append(Bed(
                phc_id=phc_id,
                total_beds=total_b,
                occupied_beds=occ_b,
                reserved_beds=res_b,
                maintenance_beds=maint_b,
                available_beds=avail_b,
                last_updated=datetime.utcnow()
            ))

            # Personnel (3 doctors, 5 nurses, 1 pharmacist, 1 lab tech)
            roles = [
                ("doctor", "Dr. A. Sharma", "MORNING"),
                ("doctor", "Dr. V. Raman", "EVENING"),
                ("nurse", "Staff Nurse Deepa", "MORNING"),
                ("nurse", "Staff Nurse Priya", "MORNING"),
                ("nurse", "Staff Nurse Ananya", "EVENING"),
                ("nurse", "Staff Nurse Selvi", "NIGHT"),
                ("pharmacist", "Pharm. K. Sundaram", "MORNING"),
                ("lab_tech", "Tech. S. Murthy", "MORNING")
            ]
            for r_idx, (role_name, staff_name, shift) in enumerate(roles):
                is_present = random.random() > 0.12
                att_status = "PRESENT" if is_present else "ABSENT"
                # Present != Available distinction
                if att_status == "PRESENT":
                    avail_status = "AVAILABLE" if random.random() > 0.20 else "ENGAGED_EMERGENCY"
                else:
                    avail_status = "UNAVAILABLE"
                
                personnel_list.append(Personnel(
                    id=f"STAFF-{phc_id}-{r_idx+1}",
                    phc_id=phc_id,
                    name=staff_name,
                    role=role_name,
                    assigned_status="ASSIGNED",
                    attendance_status=att_status,
                    availability_status=avail_status,
                    shift=shift
                ))

            # Inventories
            for med in medicines:
                inv_id = f"INV-{phc_id}-{med.id}"
                
                if phc_id == "PHC-021" and med.id == "MED-ORS":
                    # Exact Golden Path requirement: ORS stock = 850
                    c_stock = 850
                    min_res = 400
                    d_cons = 120.0
                elif dist.id == "DIST-02" and med.id == "MED-ORS" and i == 1:
                    # District B surplus warehouse
                    c_stock = 3200
                    min_res = 500
                    d_cons = 80.0
                else:
                    c_stock = random.randint(400, 2500)
                    min_res = random.randint(150, 400)
                    d_cons = round(random.uniform(20.0, 95.0), 1)

                inventories.append(Inventory(
                    id=inv_id,
                    phc_id=phc_id,
                    medicine_id=med.id,
                    current_stock=c_stock,
                    reserved_stock=int(c_stock * 0.1),
                    incoming_stock=0,
                    minimum_reserve=min_res,
                    daily_consumption=d_cons,
                    batch_number=f"BAT-2026-{random.randint(100, 999)}",
                    expiry_date=(datetime.utcnow() + timedelta(days=random.randint(90, 720))).strftime("%Y-%m-%d"),
                    last_updated=datetime.utcnow()
                ))

            # 30-day Historical Patient Footfall
            today = datetime.utcnow().date()
            for d in range(30, -1, -1):
                cur_date = today - timedelta(days=d)
                base_patients = 120 if phc_id == "PHC-021" else random.randint(60, 140)
                # Weekend effect
                if cur_date.weekday() in (5, 6):
                    base_patients = int(base_patients * 0.75)
                # Slight upward trend in last 3 days for PHC-021
                if phc_id == "PHC-021" and d <= 3:
                    base_patients = int(base_patients * (1.15 + (3 - d) * 0.1))
                
                emergencies = max(2, int(base_patients * random.uniform(0.08, 0.15)))

                footfalls.append(PatientFootfall(
                    phc_id=phc_id,
                    date=cur_date.strftime("%Y-%m-%d"),
                    patient_count=base_patients,
                    emergency_count=emergencies
                ))

            phc_counter += 1

    return {
        "states": states,
        "districts": districts,
        "medicines": medicines,
        "phcs": phcs,
        "beds": beds,
        "personnel": personnel_list,
        "inventories": inventories,
        "footfalls": footfalls
    }
