# Should We All Move to the Cloud?

## Should We All Move to the Cloud?
## I. The Problem of Generalization
Empirical evidence consistently demonstrates a peculiar gap between LLM benchmark performance and outcomes in real-world deployment scenarios. The pattern appears across domains: in medicine e.g. a systematic review of 39 benchmarks identified a "knowledge-practice gap" where models scored 70-79% on knowledge-based tests but only 46-70% on practice-based evaluations (Ji et al., 2025), while Stanford researchers observed that "evaluating clinical readiness based solely on exam performance is akin to assessing someone's driving ability using only a written test on traffic rules" (Liu et al., 2025,), and the mARC-QA benchmark found state-of-the-art models "perform poorly compared to physicians," demonstrating "lack of commonsense medical reasoning and a propensity to hallucinate" (Wang et al., 2025). In mathematics, the GSM-Symbolic study showed that minor variations to grade-school problems, as in changing names, adding irrelevant context, cause performance drops of up to 65%, leading researchers to conclude: "We found no evidence of formal reasoning in language models. The behavior is better explained by sophisticated pattern matching, so fragile, in fact, that changing names can alter results" (Mirzadeh et al., 2025). In software engineering, models scoring above 70% on SWE-bench's standard version drop to approximately 23% on the contamination-resistant Pro version (Scale AI, 2026). In general workplace tasks, a 2026 MIT study evaluating 41 models on 11,000 tasks found they achieved "minimally sufficient" work only 65% of the time, with performance lowest on tasks requiring multiple steps or nuanced judgment (MIT, 2026). And in a METR study tracking experienced developers, AI tools actually *increased* task completion time by 19%, despite developers believing they were working faster (Becker et al., 2025).

Part of the explanation is benchmark contamination: models are trained on internet-scale data, and benchmarks exist on the internet. Test data leaks into training sets. Removing contaminated examples from GSM8K reduces accuracy by at least 13% (Sun et al., 2025); models perform approximately three times better on SWE-bench Verified than on equivalent unpublished benchmarks (Scale AI, 2026). High benchmark scores may reflect memorization rather than generalizable capability.

But moreover, one pattern starts to emerge: performance degrades as conditions approach real-world complexity.

## II. Characteristics of High-Performance Domains
LLMs demonstrate strong performance in specific domains: coding benchmarks, medical licensing examinations, mathematical problem sets, standardized question-answering formats.

These domains share several characteristics:

First, high digitization. The data is clean, structured, and abundant. Code and examination content exist as text with clear training signals.

Second, closed problem spaces. Coding problems have specifications and test suites. Multiple-choice questions have single correct answers. Problem boundaries are explicit, and required information is provided rather than requiring inference from embodied experience or tacit knowledge.

Third, consistent formatting. Research on attention patterns reveals that LLMs allocate disproportionate attention to structural tokens: periods, commas, newlines (Chen et al., 2024). These markers function as anchors for information retrieval. Performance correlates with formatting consistency relative to training data; deviations in delimiters, structure, or presentation degrade performance. In some studies up to 78pp.

Fourth, extensive documentation. Popular open-source repositories include documentation, commit histories, and discussion threads. Medical examinations draw on textbook knowledge stable over decades.

Fifth, static conditions. Problems do not change during solving. There are no emergent complications, shifting contexts, or other agents with independent goals.

In summary: strong performance occurs in environments resembling training data environments characterized by digitization, closure, documentation, and stability - so where the model, due to finding the best and clear cut result to memorize, can use the probabilistic cache the most.

## III. Characteristics of Low-Performance Domains
LLMs demonstrate weaker performance in clinical practice, unstructured workplace tasks, novel situations, and tasks requiring flexible reasoning. These domains share characteristics inverse to high-performance domains:

First, data is unstructured. Real clinical records include free-text notes, ambiguous symptoms, incomplete histories, and contradictory information.

Second, problem spaces are open. Real problems lack specifications and embed in indefinitely extending contexts. Required information must be sought rather than given.

Third, knowledge is implicit. Much professional practice involves tacit knowledge that has not been, and perhaps cannot be, articulated.

Fourth, conditions are dynamic. Environments change during problem-solving. Other agents respond to interventions. Feedback loops generate emergent complexity.

Performance degrades in environments diverging from training data characteristics (See also McCoy, 2024, Embers of Autoregression)

## IV. A Theoretical Framework: The Probabilistic Cache
A theoretical account of these observations treats LLMs as probabilistic caches: systems that compress statistical regularities of training data and return outputs associated with similar inputs during training.

Empirical support for this characterization comes from Zhao et al. (2025), who investigated whether Chain-of-Thought (CoT) prompting reflects reasoning or learned patterns. Their finding: "CoT reasoning is a brittle mirage that vanishes when it is pushed beyond training distributions" (p. 1). Deviation from training patterns in task, length, or format eliminated apparent reasoning.

Further evidence comes from a 2026 study by Romasanta, Thomas, and Levina, who tested six leading models, GPT-5, Claude, Gemini, Grok, DeepSeek, and Mistral, across 15,000 simulations on strategic business decisions. The models consistently recommended strategies aligned with managerial buzzwords rather than context-specific logic, a phenomenon the researchers termed "trendslop." Even rich, industry-specific context shifted recommendations by only 11%. Simply flipping the order of options moved results by 19%. The models were not analyzing situations; they were regurgitating phrases based on frequency in training data. As the researchers put it: "On strategy, LLMs might be more akin to a freshly minted MBA or junior consultant, parroting what's popular rather than what's right for a particular situation."

This framework predicts observed performance: strong interpolation within training distributions, weak extrapolation beyond them. Novel situations, those differing structurally from training data, lack a basis for response. The system defaults to pattern-matching against superficially similar but substantively different cases, if no cache hit, it reverts to what it has seen in the training. In other circumstances we call this hallucination.

Xu (2025) formalizes related intuitions. Under the "Open World assumption", where "the range of space-time and tasks is unbounded", hallucination becomes mathematically inevitable. Under closed-world conditions, errors can be minimized. Under open-world conditions, they cannot.

The Turing Test, often cited as evidence for AI capability, measures something different than intelligence: it measures human gullibility. A system that produces fluent, confident-sounding text will fool people, not because it thinks, but because people are primed to attribute thought to fluent speech. The test reveals less about machine capability than about human susceptibility to plausible-sounding output.

## V. Interests and Infrastructure
Claims about AI capabilities come from companies with commercial interests in those claims being believed. This is not conspiracy; it is business. LLM firms want to sell their products. They frame results accordingly.

Consider recent reports of AI systems discovering security vulnerabilities. The methodological details reveal: hundreds or thousands of parallel agent sessions, iteration through known exploit techniques, input fuzzing, systematic bit manipulation, extensive compute resources. This is not novel. Automated fuzzing has been standard security practice since the 1980s. Tools like AFL, LibFuzzer, and OSS-Fuzz have discovered thousands of vulnerabilities without language models. What LLM-based systems add is a more flexible input generator. The underlying methodology, exhaustive search with validation, remains unchanged.

From the premise "System X found vulnerability Y," it does not follow that "System X understands security" or "System X reasons about code." The inference conflates finding with understanding. A random number generator, given sufficient time and a validation function, will eventually produce solutions to bounded problems. This is not intelligence; it is exhaustive search.

The infrastructure matters more than the model. On SWE-bench, top-scoring configurations employ thousands of parallel attempts, multiple models, elaborate orchestration. These setups are "very expensive." The model generates candidates; the architecture evaluates them. Would a different model, given identical scaffolding and compute, produce comparable results? Most Probably yes. You just have to throw enough compute money at the problem.

And then I'm akin to asking myself: who has access to this infrastructure? The compute resources required for these results, thousands of parallel sessions, massive orchestration systems, are concentrated in a small number of corporations. When a company announces a benchmark achievement, the relevant question is not only "what does this measure?" but "under what conditions, and who can replicate them?"

If AI capability increasingly depends on infrastructure rather than model quality, the problem is not AI regulation but monopoly regulation. The benchmark-reality gap may be less about AI limitations than about who controls the conditions under which AI appears to work  
  
**VI. The Solutions**

LLMs perform well under conditions approximating their training distribution: digitized, closed, well-documented, static environments. Performance degrades as conditions diverge. The solution is pretty obvious to me. We should move into the cloud.

Not the models, not our saas products and services - us. We should restructure our existence to match the conditions under which AI systems function optimally. Full digitization of all relevant information. Explicit specification of all constraints. Elimination of implicit knowledge. Removal of dynamic elements. All human activity logged, all decisions documented, no tacit knowledge required, no embodied inference necessary, no genuine novelty.

This would solve the benchmark-reality gap. The gap exists because reality is messy and AI needs clean conditions. If we make reality clean, the gap closes. If we become the kind of entities that fit neatly into training distributions, structured, predictable, fully digitized, then AI will finally work as advertised.

The benefits would be substantial**:**No more bodies means no more needs. No more eating, sleeping, years of education before we become useful for the people that reap the surplus value of our work ("humans are just bad flesh calculators anyway" - Scam Altman, 2026). Compared to an AI that can be spun up in seconds and replicated infinitely, to the owner of the means of production, the human worker is a remarkably poor investment, as one hears this occasionally from those who build these systems. In the cloud, we would finally be controllable and efficient.

No more politics. The tedious business of negotiating care work and leisure time simply vanishes. No one needs a lunch break in the cloud. No one needs parental leave. No one needs to commute, to rest, to recover. The entire apparatus of labor law, built to protect bodies from exploitation, becomes unnecessary. We would finally be frictionless.

No more resistance. The embodied worker can refuse, can strike, can drag her feet, can question orders, can demand explanations. She has dignity because she has needs; she has leverage because she can withdraw her labor. But the worker in the cloud simply executes. Pure availability. Pure compliance. We would finally be controllable.

We would finally be perfect, We would also be LLMs.

If the cloud is so superior to embodied existence, if freedom from the body is the ultimate liberation, if life as pure information and rational intelligence is the highest form of being, then perhaps those who believe this most fervently should go first. Let them upload themselves into their servers. Let them achieve the frictionless existence they have imagined. Let them become the perfect workers, the pure functions, the beings without needs or resistance or bodies. They could live forever because flesh will perish, but numbers are eternal.

And let them stay there.

The rest of us will remain behind. We will continue our messy, needful, finite lives. We will remain what we are: beings who exist in bodies that matter, in a world that does not submit to benchmarks. Those who find embodiment intolerable can transcend it. And those of us who insist on remaining human can finally be left in peace.

## References
Alaa, A., Bica, I., van der Schaar, M., et al. (2025). Medical large language model benchmarks should prioritize construct validity. *arXiv preprint arXiv:2503.10694*. https://arxiv.org/abs/2503.10694

Becker, J., Rush, N., Barnes, E., & Rein, D. (2025). Measuring the impact of early-2025 AI on experienced open-source developer productivity. METR. https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/

Chen, Z., Li, Y., Wang, S., et al. (2024). SepLLM: Accelerate large language models by compressing one segment into one separator. *arXiv preprint arXiv:2412.12094*. https://arxiv.org/abs/2412.12094

Dell'Acqua, F., McFowland, E., Mollick, E., Lifshitz-Assaf, H., Kellogg, K., Rajendran, S., Krayer, L., Candelon, F., & Lakhani, K. R. (2023). Navigating the jagged technological frontier: Field experimental evidence of the effects of AI on knowledge worker productivity and quality. *Harvard Business School Working Paper 24-013*. https://doi.org/10.2139/ssrn.4573321

Ji, Z., Liu, T., Wu, Z., et al. (2025). Knowledge-practice performance gap in clinical large language models: Systematic review of 39 benchmarks. *Journal of Medical Internet Research, 2025*(1), e84120. https://doi.org/10.2196/84120

Liu, Y., Yang, J., Wei, J., et al. (2025). Holistic evaluation of large language models for medical applications. Stanford Institute for Human-Centered Artificial Intelligence. https://hai.stanford.edu/news/holistic-evaluation-of-large-language-models-for-medical-applications

Mirzadeh, S. I., Alizadeh, K., Shahabi, H., Benber, B., Jha, S., Farajtabar, M., et al. (2025). GSM-Symbolic: Understanding the limitations of mathematical reasoning in large language models. *Proceedings of the Thirteenth International Conference on Learning Representations (ICLR 2025)*. https://openreview.net/forum?id=AjXkRZIvjB

MIT Workplace AI Research Team. (2026). Evaluating AI models on real-world workplace tasks: A large-scale assessment. Massachusetts Institute of Technology.

Romasanta, A., Thomas, L. D. W., & Levina, N. (2026). Researchers asked LLMs for strategic advice. They got "trendslop" in return. *Harvard Business Review*. https://hbr.org/2026/03/researchers-asked-llms-for-strategic-advice-they-got-trendslop-in-return

Sainz, O., Campos, J., García-Ferrero, I., Etxaniz, J., Lopez de Lacalle, O., & Agirre, E. (2023). NLP evaluation in trouble: On the need to measure LLM data contamination for each benchmark. In *Findings of the Association for Computational Linguistics: EMNLP 2023* (pp. 10776–10787). Association for Computational Linguistics. https://aclanthology.org/2023.findings-emnlp.722/

Scale AI. (2026). SWE-Bench Pro leaderboard: AI coding benchmark. https://labs.scale.com/leaderboard/swe_bench_pro_public

Sun, Y., Li, Z., Wang, H., et al. (2025). When benchmarks lie: Why contamination breaks LLM evaluation. *Medium*. https://thegrigorian.medium.com/when-benchmarks-lie-why-contamination-breaks-llm-evaluation

Wang, J., Chen, J., Liu, Y., et al. (2025). Limitations of large language models in clinical problem-solving arising from inflexible reasoning. *Scientific Reports, 15*, Article 22940. https://doi.org/10.1038/s41598-025-22940-0

Xu, B. (2025). Hallucination is inevitable for LLMs with the open world assumption. *PhilArchive*. https://philarchive.org/archive/XUHIIG

Zhao, C., Zeng, Y.-H., Lim, Y. J., Chuang, K.-T., et al. (2025). Is chain-of-thought reasoning of LLMs a mirage? A data distribution lens. *arXiv preprint arXiv:2508.01191*. https://arxiv.org/abs/2508.01191
