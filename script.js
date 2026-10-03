const publications = [
  { type: "Journal · 2026", category: "security", title: "Towards Practical Migration to Post Quantum SSH: System-Level Design and Evaluation", venue: "Frontiers in Computer Science", link: "" },
  { type: "Journal · 2026", category: "security", title: "An Optimal Acceleration Control for Collision Avoidance in VANETs Using Convex Optimization", venue: "Computers, Materials and Continua", link: "https://doi.org/10.32604/cmc.2026.076104" },
  { type: "Journal · 2026", category: "healthcare", title: "Leveraging Multimodal LLMs and Metaverse Technologies for Early Diagnosis of Elderly Diseases", venue: "IEEE Transactions on Computational Social Systems", link: "https://doi.org/10.1109/TCSS.2026.3665937" },
  { type: "Journal · 2025", category: "healthcare", title: "Multi scale self supervised learning for deep knowledge transfer in diabetic retinopathy grading", venue: "Scientific Reports", link: "https://doi.org/10.1038/s41598-025-85685-w" },
  { type: "Journal · 2025", category: "healthcare", title: "Balancing privacy and performance in healthcare: A federated learning framework for sensitive data", venue: "Digital Health", link: "https://doi.org/10.1177/20552076251381769" },
  { type: "Journal · 2025", category: "healthcare", title: "Transforming Earth Observation: An Extensive Evaluation of Vision Transformers for Satellite Images-Based Land Cover Classification", venue: "Expert Systems", link: "https://doi.org/10.1111/exsy.70082" },
  { type: "Journal · 2025", category: "security", title: "WristSense framework: Exploring the forensic potential of wrist-wear devices through case studies", venue: "Forensic Science International: Digital Investigation", link: "https://doi.org/10.1016/j.fsidi.2025.301862" },
  { type: "Journal · 2024", category: "security", title: "Systematic Literature Review on Wearable Digital Forensics: Acquisition Methods, Analysis Techniques, Tools, and Future Directions", venue: "IEEE Internet of Things Journal", link: "https://doi.org/10.1109/JIOT.2024.3485027" },
  { type: "Journal · 2025", category: "healthcare", title: "Design of a 3D emotion mapping model for visual feature analysis using improved Gaussian mixture models", venue: "PeerJ Computer Science", link: "https://doi.org/10.7717/peerj-cs.2596" },
  { type: "Journal · 2025", category: "healthcare", title: "Explainable Disease Classification: Exploring Grad-CAM Analysis of CNNs and ViTs", venue: "Journal of Advances in Information Technology", link: "https://doi.org/10.12720/jait.16.2.264-273" },
  { type: "Journal · 2024", category: "security", title: "Performance and Communication Cost of Deep Neural Networks in Federated Learning Environments: An Empirical Study", venue: "International Journal of Interactive Multimedia and Artificial Intelligence", link: "" },
  { type: "Journal · 2024", category: "healthcare", title: "Advancements in deep learning for Alzheimer’s disease diagnosis: A comprehensive exploration and critical analysis of neuroimaging approaches", venue: "Expert Systems", link: "https://doi.org/10.1111/exsy.13688" },
  { type: "Journal · 2023", category: "healthcare", title: "Diabetic retinopathy grading review: Current techniques and future directions", venue: "Image and Vision Computing", link: "https://doi.org/10.1016/j.imavis.2023.104821" },
  { type: "Journal · 2024", category: "security", title: "Optimizing fraud detection in financial transactions with machine learning and imbalance mitigation", venue: "Expert Systems", link: "https://doi.org/10.1111/exsy.13682" },
  { type: "Journal · 2024", category: "provenance", title: "Cloud-based provenance framework for duplicates identification and data quality enhancement", venue: "Expert Systems", link: "https://doi.org/10.1111/exsy.13600" },
  { type: "Journal · 2024", category: "security", title: "Communication Efficiency and Non-Independent and Identically Distributed Data Challenge in Federated Learning: A Systematic Mapping Study", venue: "Applied Sciences", link: "https://doi.org/10.3390/app14072720" },
  { type: "Journal · 2024", category: "security", title: "Access authentication via blockchain in space information network", venue: "PLOS ONE", link: "https://doi.org/10.1371/journal.pone.0291236" },
  { type: "Journal · 2022", category: "security", title: "Blockchain-based Distributed Renewable Energy Management Framework", venue: "IEEE Access", link: "https://doi.org/10.1109/ACCESS.2022.3196457" },
  { type: "Journal · 2022", category: "security", title: "Intrusion detection in networks using cuckoo search optimization", venue: "Soft Computing", link: "https://doi.org/10.1007/s00500-022-06798-2" },
  { type: "Journal · 2021", category: "healthcare", title: "A word embedding technique for sentiment analysis of social media to understand the relationship between Islamophobic incidents and media portrayal", venue: "PeerJ Computer Science", link: "https://doi.org/10.7717/peerj-cs.838" },
  { type: "Journal · 2021", category: "healthcare", title: "Foreground detection using motion histogram threshold algorithm in high-resolution large datasets", venue: "Multimedia Systems", link: "https://doi.org/10.1007/s00530-020-00676-3" },
  { type: "Journal · 2020", category: "security", title: "Trust-based energy-efficient routing protocol for Internet of Things-based sensor networks", venue: "International Journal of Distributed Sensor Networks", link: "https://doi.org/10.1177/1550147720964358" },
  { type: "Journal · 2020", category: "healthcare", title: "Comparison of Deep-Learning-Based Segmentation Models: Using Top View Person Images", venue: "IEEE Access", link: "https://doi.org/10.1109/ACCESS.2019.2930652" },
  { type: "Journal · 2020", category: "healthcare", title: "Computer-Aided Diagnosis for Burnt Skin Images using Deep Convolutional Neural Network", venue: "Multimedia Tools and Applications", link: "https://doi.org/10.1007/s11042-020-08768-y" },
  { type: "Journal · 2020", category: "provenance", title: "Blockchain Technology, Improvement Suggestions, Security Challenges on Smart Grid and Its Application in Healthcare", venue: "Sustainable Cities and Society", link: "https://doi.org/10.1016/j.scs.2020.102018" },
  { type: "Journal · 2019", category: "provenance", title: "Towards Reliable and Trustful Personal Health Record Systems: A Big Data case of Cloud-Dew Architecture based Provenance Framework", venue: "Journal of Ambient Intelligence and Humanized Computing", link: "https://doi.org/10.1007/s12652-019-01292-4" },
  { type: "Journal · 2018", category: "provenance", title: "An Intelligent Data Service Framework for Heterogeneous Data Sources", venue: "Journal of Grid Computing", link: "https://doi.org/10.1007/s10723-018-9443-5" },
  { type: "Journal · 2018", category: "provenance", title: "Aggregated provenance and its implications in clouds", venue: "Future Generation Computer Systems", link: "https://doi.org/10.1016/j.future.2017.10.027" },
  { type: "Journal · 2017", category: "provenance", title: "Efficient data access and performance improvement model for virtual data warehouse", venue: "Sustainable Cities and Society", link: "https://doi.org/10.1016/j.scs.2017.08.003" },
  { type: "Journal · 2017", category: "provenance", title: "Provenance based data integrity checking and verification in cloud environments", venue: "PLOS ONE", link: "https://doi.org/10.1371/journal.pone.0177576" },
  { type: "Journal · 2014", category: "healthcare", title: "Systematic skin segmentation: merging spatial and non-spatial data", venue: "Multimedia Tools and Applications", link: "https://doi.org/10.1007/s11042-012-1124-y" },
  { type: "Journal · 2018", category: "provenance", title: "Extracting reference text from citation contexts", venue: "Cluster Computing", link: "https://doi.org/10.1007/s10586-017-0954-9" },
  { type: "Conference · 2025", category: "security", title: "An Explainable AI-based Network Intrusion Detection System for Botnet Attacks", venue: "5th International Workshop on Software Security Engineering", link: "" },
  { type: "Conference · 2010", category: "provenance", title: "Workflow Enactment Engine Independent Provenance Recording for e-Science Infrastructures", venue: "Fourth IEEE International Conference on Research Challenges in Information Science", link: "http://eprints.cs.univie.ac.at/63/" },
  { type: "Conference · 2010", category: "provenance", title: "An Ant-Colony-Optimization based Approach for Determination of Parameter Significance of Scientific Workflows", venue: "24th IEEE International Conference on Advanced Information Networking and Applications", link: "https://eprints.cs.univie.ac.at/121/" },
  { type: "Conference · 2008", category: "provenance", title: "Provenance Support for Grid-Enabled Scientific Workflows", venue: "Fourth International Conference on Semantics, Knowledge, and Grid", link: "https://eprints.cs.univie.ac.at/3113/" }
];

const list = document.querySelector('#publication-list');
const showMore = document.querySelector('#show-more');
const filterButtons = [...document.querySelectorAll('.filter-button')];
let activeFilter = 'all';
let showAll = false;

function renderPublications() {
  const filtered = activeFilter === 'all' ? publications : publications.filter((item) => item.category === activeFilter);
  const visible = showAll ? filtered : filtered.slice(0, 8);
  list.innerHTML = visible.map((item) => `
    <article class="publication">
      <span class="publication-type">${item.type}</span>
      <h3>${item.title}</h3>
      <p>${item.venue}${item.link ? ` · <a href="${item.link}" target="_blank" rel="noreferrer">DOI / paper ↗</a>` : ''}</p>
    </article>
  `).join('');
  showMore.hidden = filtered.length <= 8;
  showMore.textContent = showAll ? 'Show fewer publications' : 'Show more publications';
}

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    showAll = false;
    filterButtons.forEach((item) => item.classList.toggle('is-active', item === button));
    renderPublications();
  });
});

showMore.addEventListener('click', () => {
  showAll = !showAll;
  renderPublications();
});

const menuToggle = document.querySelector('.menu-toggle');
const menu = document.querySelector('#main-menu');
menuToggle.addEventListener('click', () => {
  const open = menu.classList.toggle('is-open');
  menuToggle.setAttribute('aria-expanded', String(open));
});
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  menu.classList.remove('is-open');
  menuToggle.setAttribute('aria-expanded', 'false');
}));

document.querySelector('#year').textContent = new Date().getFullYear();
renderPublications();
