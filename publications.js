const publications = [
  { type: 'journal', year: 2026, category: 'security', authors: 'Muhammad Babar; Awais Ahmad; Sarah Kaleem; Fakhri Alam Khan; Syed Aziz Shah', title: 'Adaptive Federated Learning on Heterogeneous Consumer Devices: The Era of Next Generation AI', venue: 'IEEE Consumer Electronics Magazine', impactFactor: 5.0, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', doi: '10.1109/MCE.2026.3740656', link: 'https://doi.org/10.1109/MCE.2026.3740656' },
  { type: 'journal', year: 2026, category: 'security', authors: 'SA Baksh, IU Haq, T Helmy, FA Khan et al.', title: 'Towards Practical Migration to Post Quantum SSH: System-Level Design and Evaluation', venue: 'Frontiers in Computer Science', volume: '8', impactFactor: 3.4, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', doi: '10.3389/fcomp.2026.1844445', link: 'https://doi.org/10.3389/fcomp.2026.1844445' },
  { type: 'journal', year: 2026, category: 'healthcare', authors: 'S Alissa, M Usman and FA Khan', title: 'Exploring 3D point clouds with multimodal large language model (MLLM): A review', venue: 'Image and Vision Computing', volume: '175', impactFactor: 5.0, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', doi: '10.1016/j.imavis.2026.106202', link: 'https://doi.org/10.1016/j.imavis.2026.106202' },
  { type: 'journal', year: 2026, category: 'security', title: 'An Optimal Acceleration Control for Collision Avoidance in VANETs Using Convex Optimization', venue: 'Computers, Materials and Continua', impactFactor: 2.4, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.32604/cmc.2026.076104' },
  { type: 'journal', year: 2026, category: 'healthcare', title: 'Leveraging Multimodal LLMs and Metaverse Technologies for Early Diagnosis of Elderly Diseases', venue: 'IEEE Transactions on Computational Social Systems', impactFactor: 4.6, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1109/TCSS.2026.3665937' },
  { type: 'journal', year: 2025, category: 'healthcare', title: 'Multi scale self supervised learning for deep knowledge transfer in diabetic retinopathy grading', venue: 'Scientific Reports', impactFactor: 4.9, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1038/s41598-025-85685-w' },
  { type: 'journal', year: 2025, category: 'healthcare', title: 'Balancing privacy and performance in healthcare: A federated learning framework for sensitive data', venue: 'Digital Health', impactFactor: 3.9, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1177/20552076251381769' },
  { type: 'journal', year: 2025, category: 'healthcare', title: 'Transforming Earth Observation: An Extensive Evaluation of Vision Transformers for Satellite Images-Based Land Cover Classification', venue: 'Expert Systems', impactFactor: 3.4, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1111/exsy.70082' },
  { type: 'journal', year: 2025, category: 'security', title: 'WristSense framework: Exploring the forensic potential of wrist-wear devices through case studies', venue: 'Forensic Science International: Digital Investigation', impactFactor: 2.6, quartile: 'Q1/Q3', jcr: 'Category-specific JCR quartiles', link: 'https://doi.org/10.1016/j.fsidi.2025.301862' },
  { type: 'journal', year: 2024, category: 'security', title: 'Systematic Literature Review on Wearable Digital Forensics: Acquisition Methods, Analysis Techniques, Tools, and Future Directions', venue: 'IEEE Internet of Things Journal', impactFactor: 8.7, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1109/JIOT.2024.3485027' },
  { type: 'journal', year: 2025, category: 'healthcare', title: 'Design of a 3D emotion mapping model for visual feature analysis using improved Gaussian mixture models', venue: 'PeerJ Computer Science', impactFactor: 2.9, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.7717/peerj-cs.2596' },
  { type: 'journal', year: 2025, category: 'healthcare', title: 'Explainable Disease Classification: Exploring Grad-CAM Analysis of CNNs and ViTs', venue: 'Journal of Advances in Information Technology', impactFactor: null, quartile: 'Q4 / ESCI', jcr: 'ESCI; no verified JIF shown', link: 'https://doi.org/10.12720/jait.16.2.264-273' },
  { type: 'journal', year: 2024, category: 'security', title: 'Performance and Communication Cost of Deep Neural Networks in Federated Learning Environments: An Empirical Study', venue: 'International Journal of Interactive Multimedia and Artificial Intelligence', impactFactor: 2.9, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', link: '' },
  { type: 'journal', year: 2024, category: 'healthcare', title: 'Advancements in deep learning for Alzheimer’s disease diagnosis: A comprehensive exploration and critical analysis of neuroimaging approaches', venue: 'Expert Systems', impactFactor: 3.4, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1111/exsy.13688' },
  { type: 'journal', year: 2023, category: 'healthcare', title: 'Diabetic retinopathy grading review: Current techniques and future directions', venue: 'Image and Vision Computing', impactFactor: 5.0, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1016/j.imavis.2023.104821' },
  { type: 'journal', year: 2024, category: 'security', title: 'Optimizing fraud detection in financial transactions with machine learning and imbalance mitigation', venue: 'Expert Systems', impactFactor: 3.4, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1111/exsy.13682' },
  { type: 'journal', year: 2024, category: 'provenance', title: 'Cloud-based provenance framework for duplicates identification and data quality enhancement', venue: 'Expert Systems', impactFactor: 3.4, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1111/exsy.13600' },
  { type: 'journal', year: 2024, category: 'security', title: 'Communication Efficiency and Non-Independent and Identically Distributed Data Challenge in Federated Learning: A Systematic Mapping Study', venue: 'Applied Sciences', impactFactor: 2.9, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.3390/app14072720' },
  { type: 'journal', year: 2024, category: 'security', title: 'Access authentication via blockchain in space information network', venue: 'PLOS ONE', impactFactor: 2.8, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1371/journal.pone.0291236' },
  { type: 'journal', year: 2022, category: 'security', title: 'Blockchain-based Distributed Renewable Energy Management Framework', venue: 'IEEE Access', impactFactor: 4.2, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1109/ACCESS.2022.3196457' },
  { type: 'journal', year: 2022, category: 'security', title: 'Intrusion detection in networks using cuckoo search optimization', venue: 'Soft Computing', impactFactor: 2.5, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1007/s00500-022-06798-2' },
  { type: 'journal', year: 2021, category: 'healthcare', title: 'A word embedding technique for sentiment analysis of social media to understand the relationship between Islamophobic incidents and media portrayal of Muslim communities', venue: 'PeerJ Computer Science', impactFactor: 2.9, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.7717/peerj-cs.838' },
  { type: 'journal', year: 2021, category: 'healthcare', title: 'Foreground detection using motion histogram threshold algorithm in high-resolution large datasets', venue: 'Multimedia Systems', impactFactor: 2.8, quartile: 'Q1/Q3', jcr: 'Category-specific JCR quartiles', link: 'https://doi.org/10.1007/s00530-020-00676-3' },
  { type: 'journal', year: 2020, category: 'security', title: 'Trust-based energy-efficient routing protocol for Internet of things–based sensor networks', venue: 'International Journal of Distributed Sensor Networks', impactFactor: 2.0, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1177/1550147720964358' },
  { type: 'journal', year: 2020, category: 'healthcare', title: 'Comparison of Deep-Learning-Based Segmentation Models: Using Top View Person Images', venue: 'IEEE Access', impactFactor: 4.2, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1109/ACCESS.2019.2930652' },
  { type: 'journal', year: 2020, category: 'healthcare', title: 'Computer-Aided Diagnosis for Burnt Skin Images using Deep Convolutional Neural Network', venue: 'Multimedia Tools and Applications', impactFactor: 3.0, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1007/s11042-020-08768-y' },
  { type: 'journal', year: 2020, category: 'provenance', title: 'Blockchain Technology, Improvement Suggestions, Security Challenges on Smart Grid and Its Application in Healthcare for Sustainable Development', venue: 'Sustainable Cities and Society', impactFactor: 13.3, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1016/j.scs.2020.102018' },
  { type: 'journal', year: 2020, category: 'healthcare', title: 'Burnt Human Skin Segmentation and Depth Classification using Deep Convolutional Neural Network (DCNN)', venue: 'Journal of Medical Imaging and Health Informatics', impactFactor: null, quartile: 'Not JIF-ranked', jcr: 'No verified current JIF; discontinued from latest JCR listings', link: 'https://doi.org/10.1166/jmihi.2020.3258' },
  { type: 'journal', year: 2022, category: 'provenance', title: 'An analytic study of architecture, security, privacy, query processing, and performance evaluation of database-as-a-service', venue: 'Transactions on Emerging Telecommunications Technologies', impactFactor: 2.6, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1002/ett.3814' },
  { type: 'journal', year: 2020, category: 'security', title: 'Countering Malicious URLs in Internet-of-Thing (IoT) using a knowledge-based approach and simulated expert', venue: 'IEEE Internet of Things Journal', impactFactor: 8.7, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1109/JIOT.2019.2954919' },
  { type: 'journal', year: 2020, category: 'security', title: 'Static malware detection and attribution in android Byte-code through an end-to-end deep system', venue: 'Future Generation Computer Systems', impactFactor: 5.9, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1016/j.future.2019.07.070' },
  { type: 'journal', year: 2019, category: 'security', title: 'Energy-efficient Harvested-Aware clustering and cooperative Routing Protocol for WBAN (E-HARP)', venue: 'IEEE Access', impactFactor: 4.2, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1109/ACCESS.2019.2930652' },
  { type: 'journal', year: 2019, category: 'provenance', title: 'Towards Reliable and Trustful Personal Health Record Systems: A Big Data case of Cloud-Dew Architecture based Provenance Framework', venue: 'Journal of Ambient Intelligence and Humanized Computing', impactFactor: null, quartile: 'Q2 (SJR; JIF verify)', jcr: 'Public JCR value not verified', link: 'https://doi.org/10.1007/s12652-019-01292-4' },
  { type: 'journal', year: 2020, category: 'security', title: 'Optimized clustering in vehicular ad hoc networks based on honey bee and genetic algorithm for internet of things', venue: 'Peer-to-Peer Networking and Applications', impactFactor: null, quartile: 'Q2 (SJR; JIF verify)', jcr: 'Public JCR value not verified', link: 'https://doi.org/10.1007/s12083-019-00724-4' },
  { type: 'journal', year: 2019, category: 'security', title: 'Hybrid and Multi-hop Advanced Zonal-Stable Election Protocol for Wireless Sensor Networks', venue: 'IEEE Access', impactFactor: 4.2, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1109/ACCESS.2019.2899752' },
  { type: 'journal', year: 2018, category: 'provenance', title: 'Awareness and willingness to use PHR: a roadmap towards cloud-dew architecture based PHR framework', venue: 'Multimedia Tools and Applications', impactFactor: 3.0, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1007/s11042-018-6692-z' },
  { type: 'journal', year: 2018, category: 'security', title: 'Energy optimization of PR-LEACH routing scheme using distance awareness in internet of things networks', venue: 'International Journal of Parallel Programming', impactFactor: 2.5, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1007/s10766-018-0586-6' },
  { type: 'journal', year: 2018, category: 'provenance', title: 'An Intelligent Data Service Framework for Heterogeneous Data Sources', venue: 'Journal of Grid Computing', impactFactor: 3.9, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1007/s10723-018-9443-5' },
  { type: 'journal', year: 2018, category: 'security', title: '3D weighted centroid algorithm & RSSI ranging model strategy for node localization in WSN based on smart devices', venue: 'Sustainable Cities and Society', impactFactor: 13.3, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1016/j.scs.2018.02.022' },
  { type: 'journal', year: 2019, category: 'provenance', title: 'Reference terms identification of cited articles as topics from citation contexts', venue: 'Computers & Electrical Engineering', impactFactor: 5.5, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1016/j.compeleceng.2018.02.029' },
  { type: 'journal', year: 2017, category: 'provenance', title: 'Efficient data access and performance improvement model for virtual data warehouse', venue: 'Sustainable Cities and Society', impactFactor: 13.3, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1016/j.scs.2017.08.003' },
  { type: 'journal', year: 2018, category: 'provenance', title: 'Aggregated provenance and its implications in clouds', venue: 'Future Generation Computer Systems', impactFactor: 5.9, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1016/j.future.2017.10.027' },
  { type: 'journal', year: 2017, category: 'security', title: 'Monitoring square and circular fields with sensors using energy-efficient cluster-based routing for underwater wireless sensor networks', venue: 'International Journal of Distributed Sensor Networks', impactFactor: 2.0, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', link: '' },
  { type: 'journal', year: 2017, category: 'provenance', title: 'Provenance based data integrity checking and verification in cloud environments', venue: 'PLOS ONE', impactFactor: 2.8, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1371/journal.pone.0177576' },
  { type: 'journal', year: 2019, category: 'security', title: 'Privacy by Architecture Pseudonym Framework for Delay Tolerant Network', venue: 'Future Generation Computer Systems', impactFactor: 5.9, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1016/j.future.2017.11.017' },
  { type: 'journal', year: 2014, category: 'healthcare', title: 'Systematic skin segmentation: merging spatial and non-spatial data', venue: 'Multimedia Tools and Applications', impactFactor: 3.0, quartile: 'Q2', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1007/s11042-012-1124-y' },
  { type: 'journal', year: 2018, category: 'provenance', title: 'Extracting reference text from citation contexts', venue: 'Cluster Computing', impactFactor: 5.5, quartile: 'Q1', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1007/s10586-017-0954-9' },
  { type: 'journal', year: 2015, category: 'security', title: 'Co-UWSN: cooperative energy-efficient protocol for underwater WSNs', venue: 'International Journal of Distributed Sensor Networks', impactFactor: 2.0, quartile: 'Q3', jcr: 'JCR 2026 · 2025 metric year', link: 'https://doi.org/10.1155/2015/891410' },
  { type: 'journal', year: 2016, category: 'security', title: 'ETEEM- Extended Traffic-Aware Energy-Efficient MAC Scheme for WSNs', venue: 'International Journal of Advanced Computer Science and Applications', impactFactor: 1.1, quartile: 'Q4 / ESCI', jcr: 'ESCI JIF; verify institutional JCR category', link: 'https://doi.org/10.14569/ijacsa.2016.071134' },
  { type: 'journal', year: 2011, category: 'provenance', title: 'Towards Next Generation Provenance Systems for e-Science', venue: 'International Journal of Information System Modeling and Design', impactFactor: null, quartile: 'Not JIF-ranked', jcr: 'No verified current JIF shown', link: 'https://doi.org/10.4018/jismd.2011070102' },
  { type: 'conference', year: 2025, category: 'security', title: 'An Explainable AI-based Network Intrusion Detection System for Botnet Attacks', venue: '5th International Workshop on Software Security Engineering · Istanbul', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: '' },
  { type: 'conference', year: 2024, category: 'healthcare', title: 'Explainable Disease Classification: Exploring Grad-CAM Analysis of CNNs and ViTs', venue: '17th International Conference on Computer Science and Information Technology · Dubai', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: '' },
  { type: 'conference', year: 2024, category: 'security', title: 'Automating Security Incident Response in SCADA Systems through SIEM-ML Integration', venue: '29th International Conference on Automation and Computing · Sunderland', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: '' },
  { type: 'conference', year: 2024, category: 'security', title: 'WristSense: A Wrist-wear Dataset for Identifying Aggressive Tendencies', venue: '20th International Conference on Artificial Intelligence Applications and Innovations · Corfu', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: '' },
  { type: 'conference', year: 2010, category: 'provenance', title: 'Workflow Enactment Engine Independent Provenance Recording for e-Science Infrastructures', venue: 'Fourth IEEE International Conference on Research Challenges in Information Science · Nice', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: 'http://eprints.cs.univie.ac.at/63/' },
  { type: 'conference', year: 2010, category: 'provenance', title: 'An Ant-Colony-Optimization based Approach for Determination of Parameter Significance of Scientific Workflows', venue: '24th IEEE International Conference on Advanced Information Networking and Applications · Perth', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: 'https://eprints.cs.univie.ac.at/121/' },
  { type: 'conference', year: 2009, category: 'provenance', title: 'Estimation of Parameters Sensitivity for Scientific Workflows', venue: 'ADPNA Third International Workshop on Advanced Distributed and Parallel Network Applications · Vienna', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: 'https://eprints.cs.univie.ac.at/133/' },
  { type: 'conference', year: 2008, category: 'provenance', title: 'Provenance Support for Grid-Enabled Scientific Workflows', venue: 'Fourth International Conference on Semantics, Knowledge, and Grid · Beijing', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: 'https://eprints.cs.univie.ac.at/3113/' },
  { type: 'conference', year: 2008, category: 'healthcare', title: 'Grid-Enabled Non-Invasive Blood Glucose Measurement', venue: 'Computational Science – ICCS 2008 · Krakow', impactFactor: null, quartile: 'Not applicable', jcr: 'Conference publication', link: 'https://doi.org/10.1007/978-3-540-69384-0_13' }
];

const quartileRank = (quartile) => {
  if (quartile.startsWith('Q1')) return 1;
  if (quartile.startsWith('Q2')) return 2;
  if (quartile.startsWith('Q3')) return 3;
  if (quartile.startsWith('Q4')) return 4;
  return 9;
};

const formatImpact = (value) => value === null ? 'No verified JIF' : `JIF ${value.toFixed(1)}`;
const typeLabel = (type) => type === 'journal' ? 'Journal' : 'Conference';

function publicationMarkup(item, dark = false) {
  const link = item.link ? ` · <a href="${item.link}" target="_blank" rel="noreferrer">View Publication ↗</a>` : '';
  const authors = item.authors ? `<p class="publication-authors">${item.authors}</p>` : '';
  const volume = item.volume ? ` · Volume ${item.volume}` : '';
  const published = item.published ? ` · Published ${item.published}` : '';
  return `<article class="publication ${dark ? '' : 'publication-light'}">
    <div class="publication-meta"><span class="publication-type">${typeLabel(item.type)} · ${item.year}</span><span class="publication-year">${item.year}</span></div>
    <h3>${item.title}</h3>
    ${authors}
    <p class="publication-venue"><strong>${item.venue}</strong>${volume}${published}${link}</p>
    <div class="publication-metrics"><span>${formatImpact(item.impactFactor)}</span><span>${item.quartile}</span><span>${item.jcr}</span></div>
  </article>`;
}

const homeList = document.querySelector('#publication-list');
const homeShowMore = document.querySelector('#show-more');
const homeFilters = [...document.querySelectorAll('.filter-button')];

if (homeList) {
  let activeFilter = 'all';
  let showAll = false;
  const renderHome = () => {
    const filtered = activeFilter === 'all' ? publications : publications.filter((item) => item.category === activeFilter);
    homeList.innerHTML = filtered.slice(0, showAll ? filtered.length : 8).map((item) => publicationMarkup(item, true)).join('');
    if (homeShowMore) {
      homeShowMore.hidden = filtered.length <= 8;
      homeShowMore.textContent = showAll ? 'Show fewer publications' : 'Show more publications';
    }
  };
  homeFilters.forEach((button) => button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    showAll = false;
    homeFilters.forEach((item) => item.classList.toggle('is-active', item === button));
    renderHome();
  }));
  if (homeShowMore) homeShowMore.addEventListener('click', () => { showAll = !showAll; renderHome(); });
  renderHome();
}

const fullGrid = document.querySelector('#publication-grid');
if (fullGrid) {
  const search = document.querySelector('#publication-search');
  const sort = document.querySelector('#sort-publications');
  const quartile = document.querySelector('#filter-quartile');
  const type = document.querySelector('#filter-type');
  const count = document.querySelector('#publication-count');
  const renderFull = () => {
    const query = (search.value || '').trim().toLowerCase();
    let filtered = publications.filter((item) => {
      const haystack = `${item.title} ${item.venue} ${item.year}`.toLowerCase();
      const quartileMatch = quartile.value === 'all' || (quartile.value === 'none' ? item.impactFactor === null : item.quartile.includes(quartile.value));
      return (!query || haystack.includes(query)) && quartileMatch && (type.value === 'all' || item.type === type.value);
    });
    filtered.sort((a, b) => {
      if (sort.value === 'year-asc') return a.year - b.year;
      if (sort.value === 'impact-desc') return (b.impactFactor ?? -1) - (a.impactFactor ?? -1) || b.year - a.year;
      if (sort.value === 'impact-asc') return (a.impactFactor ?? 999) - (b.impactFactor ?? 999) || b.year - a.year;
      if (sort.value === 'quartile') return quartileRank(a.quartile) - quartileRank(b.quartile) || b.year - a.year;
      return b.year - a.year;
    });
    fullGrid.innerHTML = filtered.map((item) => publicationMarkup(item)).join('');
    count.textContent = `${filtered.length} publication${filtered.length === 1 ? '' : 's'} shown · ${publications.length} total`;
  };
  [search, sort, quartile, type].forEach((control) => control.addEventListener('input', renderFull));
  [sort, quartile, type].forEach((control) => control.addEventListener('change', renderFull));
  renderFull();
}
