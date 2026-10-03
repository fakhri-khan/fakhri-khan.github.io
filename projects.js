const projects = [
  { title: 'Enhancing Performance and Attack Resilience of Kyber based Post Quantum Secure Bootloaders against Side-Channel and Fault Attacks in Embedded Systems', code: 'IN26098', role: 'PI', funder: 'DROC, KFUPM', grant: 241000, startYear: 2026, period: 'May 2026 - April 2028', status: 'Active' },
  { title: 'Fine-Grained Motion Control in Temporally Consistent Image-to-Video Generation', code: 'IN26144', role: 'Co-I', funder: 'DROC, KFUPM', grant: 383500, startYear: 2026, period: 'May 2026 - December 2028', status: 'Active' },
  { title: 'Trustworthy and Physically-Consistent Transformer-Based Motion Generation for Secure Autonomous and Smart Systems', code: 'INSS2641', role: 'Co-I', funder: 'DROC, KFUPM', grant: 350000, startYear: 2026, period: 'May 2026 - April 2028', status: 'Active' },
  { title: 'Deep Learning-based Workflow for Enhanced Bioactivity Prediction of Fungal Compounds', code: 'INSS2607', role: 'PI', funder: 'IRC-ISS, KFUPM', grant: 37500, startYear: 2026, period: 'April 2026 - December 2026', status: 'Active' },
  { title: 'Deep Learning for Retinopathy of Prematurity: AI-based Detection and Triage of Plus Disease', code: 'JRC-AI-KKESH-02', role: 'PI', funder: 'JRC-AI, SDAIA', grant: 30000, startYear: 2026, period: 'September 2026 - July 2027', status: 'Active' },
  { title: 'Provenance-based Intelligent Search Framework for Cloud', code: 'SR211008', role: 'PI', funder: 'DROC, KFUPM', grant: 73230, startYear: 2022, period: 'February 2022 - May 2023', status: 'Completed' },
  { title: 'Automated Detection of Diabetic Changes in Fundus Photographs', code: 'INSS2205', role: 'PI', funder: 'IRC-ISS, KFUPM', grant: 111300, startYear: 2022, period: 'June 2022 - January 2024', status: 'Completed' },
  { title: 'Wearable Digital Forensics: A Framework to Identify Digital Evidence and Risk Factors that lead to Aggressive Behavior', code: 'INSS2301', role: 'PI', funder: 'IRC-ISS, KFUPM', grant: 76700, startYear: 2023, period: 'February 2023 - January 2024', status: 'Completed' },
  { title: 'A Novel Formulation for Rapid and Precise Early-Stage Alzheimer’s Detection Using Deep Learning Models', code: 'JRC-AI-RFP-12', role: 'PI', funder: 'JRC-AI, SDAIA', grant: 120000, startYear: 2023, period: 'October 2023 - August 2024', status: 'Completed' },
  { title: 'Automated Detection of Diabetic Retinopathy Severity using Self-supervised Learning and Embedded Knowledge Detection', code: 'JRC-AI-RG-06', role: 'PI', funder: 'JRC-AI, SDAIA', grant: 150000, startYear: 2023, period: 'October 2023 - August 2024', status: 'Completed' },
  { title: 'Mechanism of stress redistribution and soil arching in granular media under trapdoor conditions using discrete element method', code: 'INCB2303', role: 'Co-I', funder: 'IRC-CBM, KFUPM', grant: 51180, startYear: 2023, period: 'January 2023 - December 2023', status: 'Completed' },
  { title: 'Characterization of Construction and Demolition Wastes for Geotechnical Applications in Saudi Arabia', code: 'INCB2323', role: 'Co-I', funder: 'IRC-CBM, KFUPM', grant: 19550, startYear: 2023, period: 'July 2023 - June 2024', status: 'Completed' }
];

const projectList = document.querySelector('#project-list');
const projectSort = document.querySelector('#sort-projects');
const projectCount = document.querySelector('#project-count');

if (projectList && projectSort && projectCount) {
  const money = (value) => `SAR ${value.toLocaleString('en-US')}`;
  const roleRank = (role) => role === 'PI' ? 0 : 1;

  function renderProjects() {
    const items = [...projects].sort((a, b) => {
      if (projectSort.value === 'year-asc') return a.startYear - b.startYear || b.grant - a.grant;
      if (projectSort.value === 'grant-desc') return b.grant - a.grant || b.startYear - a.startYear;
      if (projectSort.value === 'grant-asc') return a.grant - b.grant || b.startYear - a.startYear;
      if (projectSort.value === 'role') return roleRank(a.role) - roleRank(b.role) || b.startYear - a.startYear || b.grant - a.grant;
      return b.startYear - a.startYear || b.grant - a.grant;
    });

    projectList.innerHTML = items.map((project) => `
      <article class="project-item project-card">
        <div class="project-status">${project.status} · ${project.role}</div>
        <div><h3>${project.title}</h3><p><strong>Project No. ${project.code}</strong> · Funded by ${project.funder}</p></div>
        <div class="project-value"><strong>${money(project.grant)}</strong><span>${project.period}</span></div>
      </article>
    `).join('');
    projectCount.textContent = `${items.length} funded research projects`;
  }

  projectSort.addEventListener('change', renderProjects);
  renderProjects();
}
