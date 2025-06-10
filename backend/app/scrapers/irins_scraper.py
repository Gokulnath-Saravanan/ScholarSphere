import requests
from bs4 import BeautifulSoup
import time
import re

# --- DB Placeholders (replace with your actual DB code) ---
def upsert_faculty(faculty):
    # Replace with your DB insert/update logic
    print(f"Upserting faculty: {faculty['name']} ({faculty['profile_url']})")

def upsert_publication(publication):
    # Replace with your DB insert/update logic
    print(f"  Upserting publication: {publication['title']} ({publication['year']})")

# --- Extraction Functions ---

def extract_faculty_links(profile_html):
    soup = BeautifulSoup(profile_html, "html.parser")
    links = []
    list_org = soup.find("div", id="list_org")
    if list_org:
        for a in list_org.find_all("a", href=True):
            url = a["href"]
            if url.startswith("/"):
                url = "https://msrit.irins.org" + url
            links.append(url)
    return links

def extract_faculty_info(profile_html, profile_url):
    soup = BeautifulSoup(profile_html, "html.parser")
    # Name
    name = None
    h1 = soup.find("h1")
    if h1:
        name = h1.get_text(strip=True).replace("Dr ", "").replace("Prof ", "")
    # Gender
    gender = None
    for span in soup.select("div.name-location span"):
        if "Male" in span.text or "Female" in span.text:
            gender = span.text.strip()
    # Department
    department = None
    exp_panel = soup.find("div", id="list_panel_experience")
    if exp_panel:
        for li in exp_panel.find_all("li"):
            txt = li.get_text()
            m = re.search(r"Department of (.+)", txt)
            if m:
                department = m.group(1).strip()
                break
    # Institution
    institution = None
    for li in soup.select("ul.name-location li"):
        if "Institute" in li.text or "College" in li.text:
            institution = li.text.strip()
    # Profile photo
    photo_url = None
    img = soup.find("img", {"id": "preview img-custom"})
    if img:
        photo_url = img["src"]
    # Profile URL
    # (use the one passed in)
    # ORCID, Scopus, Researcher, Google Scholar, Vidwan
    def get_id(span_id):
        s = soup.find("span", id=span_id)
        return s.a.text.strip() if s and s.a else None
    orcid_id = get_id("i_orcid_id")
    scopus_id = get_id("i_scopus_id")
    researcher_id = get_id("i_isi_id")
    google_scholar_id = get_id("i_google_sid")
    vidwan_id = None
    badge = soup.find("h4", class_="badge")
    if badge and "Vidwan-ID" in badge.text:
        vidwan_id = badge.text.split(":")[-1].strip()
    # Expertise
    expertise = None
    exp = soup.find("h5", id="e_s_expertise")
    if exp:
        expertise = exp.get_text(strip=True)
    # Experience
    experience = []
    exp_panel = soup.find("div", id="list_panel_experience")
    if exp_panel:
        for li in exp_panel.find_all("li"):
            role = li.find("h2").get_text(strip=True) if li.find("h2") else ""
            orgs = [p.get_text(strip=True) for p in li.find_all("p")]
            years = li.find("span")
            years = years.get_text(strip=True) if years else ""
            experience.append({"role": role, "orgs": orgs, "years": years})
    # Education
    education = []
    edu_panel = soup.find("div", id="list_panel_qualification")
    if edu_panel:
        for li in edu_panel.find_all("li"):
            degree = li.find("h2").get_text(strip=True) if li.find("h2") else ""
            inst = li.find("p").get_text(strip=True) if li.find("p") else ""
            year = li.find("span")
            year = year.get_text(strip=True) if year else ""
            education.append({"degree": degree, "institution": inst, "year": year})
    # Research Projects
    research_projects = []
    rp_panel = soup.find("div", id="rp-form-view")
    if rp_panel:
        for rp in rp_panel.find_all("div", id="rp-view"):
            title = rp.find("h2").get_text(strip=True) if rp.find("h2") else ""
            details = rp.find("h5").get_text(strip=True) if rp.find("h5") else ""
            research_projects.append({"title": title, "details": details})
    # Citations & h-index
    citations = None
    h_index = None
    for div in soup.find_all("div", class_="Cell-citation"):
        txt = div.get_text()
        if "Citations" in txt:
            m = re.search(r"(\d+)", txt)
            if m:
                citations = int(m.group(1))
        if "h-index" in txt.lower():
            m = re.search(r"(\d+)", txt)
            if m:
                h_index = int(m.group(1))
    # Google Scholar section
    gs = soup.find("div", id="google_scolar_citation")
    if gs:
        for span in gs.find_all("span", class_="counter"):
            val = span.get_text(strip=True)
            if val.isdigit():
                if citations is None:
                    citations = int(val)
                elif h_index is None:
                    h_index = int(val)
    # Profile links
    profile_links = []
    for a in soup.select("a[href]"):
        href = a["href"]
        if "vidwan" in href or "linkedin" in href or "msrit.edu" in href:
            profile_links.append(href)
    # Return as dict
    return {
        "name": name,
        "gender": gender,
        "department": department,
        "institution": institution,
        "profile_url": profile_url,
        "photo_url": photo_url,
        "orcid_id": orcid_id,
        "scopus_id": scopus_id,
        "researcher_id": researcher_id,
        "google_scholar_id": google_scholar_id,
        "vidwan_id": vidwan_id,
        "expertise": expertise,
        "experience": experience,
        "education": education,
        "research_projects": research_projects,
        "citations": citations,
        "h_index": h_index,
        "profile_links": profile_links,
    }

def fetch_publications(expert_id):
    publications = []
    current_page = 0
    while True:
        data = {
            "current_page": current_page,
            "expert_id": expert_id,
            "sort_by": "year",
            "direction": "desc"
        }
        resp = requests.post("https://msrit.irins.org/profile/get_publication", data=data)
        if not resp.text.strip():
            break
        soup = BeautifulSoup(resp.text, "html.parser")
        pub_divs = soup.find_all("div", class_="funny-boxes")
        if not pub_divs:
            break
        for pub in pub_divs:
            title = pub.find("h2").get_text(strip=True) if pub.find("h2") else ""
            year = None
            m = re.search(r"\b(19|20)\d{2}\b", pub.get_text())
            if m:
                year = m.group(0)
            pub_type = pub.find("span", class_="label")
            pub_type = pub_type.get_text(strip=True) if pub_type else ""
            # Add more fields as needed
            publications.append({
                "title": title,
                "year": year,
                "type": pub_type,
                # Add more fields as needed
            })
        current_page += 1
        time.sleep(0.5)  # Be polite
    return publications

def get_expert_id(profile_html):
    soup = BeautifulSoup(profile_html, "html.parser")
    inp = soup.find("input", id="expert_id")
    return inp["value"] if inp else None

def main(start_profile_url):
    visited = set()
    to_visit = [start_profile_url]
    while to_visit:
        url = to_visit.pop()
        if url in visited:
            continue
        print(f"Scraping: {url}")
        visited.add(url)
        resp = requests.get(url)
        if resp.status_code != 200:
            print(f"Failed to fetch {url}")
            continue
        faculty_info = extract_faculty_info(resp.text, url)
        expert_id = get_expert_id(resp.text)
        if not expert_id:
            print(f"Could not find expert_id for {url}")
            continue
        publications = fetch_publications(expert_id)
        # Store in DB
        upsert_faculty(faculty_info)
        for pub in publications:
            pub["faculty_profile_url"] = url
            upsert_publication(pub)
        # Get more faculty links from sidebar
        new_links = extract_faculty_links(resp.text)
        for l in new_links:
            if l not in visited and l not in to_visit:
                to_visit.append(l)
        time.sleep(1)  # Be polite

if __name__ == "__main__":
    # Start from any known profile in the department
    main("https://msrit.irins.org/profile/538701")