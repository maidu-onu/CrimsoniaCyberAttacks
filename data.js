"use strict";
export const citiesBerylia = [
  "Bancroft",
  "Moazac",
  "Lambeck",
  "Durgan",
  "Portsmith",
  "Kral",
  "Erack",
  "Glassmoor",
  "Elev",
  "Koat",
  "Kranin",
  "Tanix",
  "Carcastle",
  "Zechan",
  "Janford",
  "Roseiron",
  "Wildehill",
  "Vundan",
  "Tettlewick",
  "Bakun",
  "Paldar",
  "Norville",
  "Mizim",
  "Pineland",
  "Vear",
  "Adeasa",
];

export const citiesCrimsonia = [
  "Strin",
  "Streka",
  "Ugrark",
  "Vrodnard",
  "Daka",
  "Srodon",
  "Vlando",
  "Upul",
  "Xurg",
  "Olkburg",
  "Goit",
  "Drespus",
];

export const citiesRevalia = [
  "Valora",
  "Eldhrim",
  "Fjallborg",
  "Njordheim",
  "Runestad",
];
export const cities = [...citiesBerylia, ...citiesCrimsonia, ...citiesRevalia];

export const descLvl1 = [
  "Network scanning port 80 (CVE-2023-12345)",
  "XSS vulnerability on /contact-us (CVE-2023-23456)",
  "Info leak via error messages, System paths revealed (CVE-2023-34567)",
  "SQL Injection on /submit-form (CVE-2023-45678)",
  "Clickjacking attempt on banking portal (CVE-2023-56789)",
  "Buffer overflow crash, Server ABC (CVE-2023-67890)",
  "IDOR exposed user data on /user-profile (CVE-2023-78901)",
  "Unauthenticated API access (CVE-2023-89012)",
  "Session hijacking attempt (CVE-2023-90123)",
  "Brute-force attempt on weak password policy (CVE-2023-01234)",
];
export const descLvl2 = [
  "RCE exploited in Apache HTTP server (CVE-2024-01345)",
  "Privilege escalation on firewall, Unauthorized access (CVE-2024-02456)",
  "Authentication bypass on VPN gateway (CVE-2024-03567)",
  "Directory traversal in CMS (CVE-2024-04678)",
  "MITM due to weak SSL on VPN (CVE-2024-05789)",
  "CSRF detected on financial app (CVE-2024-06890)",
  "DoS attack on IoT device (CVE-2024-07901)",
  "File upload vulnerability in web app (CVE-2024-08012)",
  "Command injection in device management (CVE-2024-09123)",
  "RCE in database management system (CVE-2024-10234)",
];
export const descLvl3 = [
  "Zero-Day exploit in enterprise system (CVE-2025-01345)",
  "Exploited flaw in national infrastructure system (CVE-2025-02456)",
  "APT malware exploiting OS kernel flaw (CVE-2025-03567)",
  "SCADA system attack, Unauthorized manipulation (CVE-2025-04678)",
  "Data leak in government servers (CVE-2025-05789)",
  "Privilege escalation in military communications (CVE-2025-06890)",
  "Data exfiltration in cloud service (CVE-2025-07901)",
  "Critical vulnerability in national power grid (CVE-2025-08012)",
  "Destructive cyber attack on central banking (CVE-2025-09123)",
  "Cyber weapon targeting defense networks (CVE-2025-10234)",
];
export const attackDesc = [descLvl1, descLvl2, descLvl3];
