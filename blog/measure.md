# The Measure and the Mirage

## Prologue: A 57-Point Gap
In late 2025, researchers evaluated ten safety guardrail models—the systems designed to prevent large language models from generating harmful content. One model, Qwen3Guard-8B, achieved 85.3% accuracy on the standard benchmark. An impressive score. A number suggesting robust capability. A number that might justify deployment in consumer-facing applications where safety matters. Then they tested it on novel prompts—inputs not derived from the public datasets that populate most benchmarks. Performance dropped to 33.8%. A 57.2 percentage point collapse (Chen et al., 2025).

The same year, a team publishing in *Nature Scientific Reports* constructed mARC-QA, a clinical reasoning benchmark designed to test whether language models could adapt their thinking when familiar patterns led astray—what psychologists call the Einstellung effect (Chung et al., 2025). The problems were not difficult in any technical sense. They required commonsense medical reasoning of the sort a practicing physician would find routine. State-of-the-art models—GPT-4, o1, Claude, DeepSeek—performed poorly compared to human doctors, demonstrating what the authors called "a propensity to hallucinate" and "lack of commonsense medical reasoning."

These are not isolated anomalies. They are symptoms of a deeper problem: a systematic disconnect between what benchmarks measure and what we think they measure.

This essay is an attempt to describe how we err.

## I. The Medium and the Deception
Language is one way how humans recognize intelligence in one another. We speak, and in speaking reveal—or seem to reveal—the structure of thought behind the words. When someone articulates a complex argument, draws an unexpected connection, corrects themselves mid-sentence, we infer a mind at work.

The heuristics by which we recognize intelligence evolved for judging other humans. Grammatical fluency signals linguistic competence. Coherent argumentation signals reasoning capacity. Domain vocabulary signals expertise. Self-correction signals reflection. These proxies function adequately in social cognition because they developed for creatures who share our cognitive architecture, our developmental trajectory, our embodied existence in the world.

When the same heuristics are applied to systems with fundamentally different architectures, they become unreliable in ways we cannot easily detect. The system may produce grammatically perfect, coherently argued, technically sophisticated outputs through processes that bear no structural resemblance to human thought. The surface matches our expectations; the depth is incommensurable with our categories.

Alan Turing's famous test operationalized this problem without resolving it. Can a machine produce responses indistinguishable from a human's? The implicit logic: if distinction is impossible, the underlying capability must be equivalent—or the distinction must be meaningless. But this logic inverts the epistemic situation. What the test measures is the discriminative capacity of the human judge, not the capability of the machine. A machine passes to the extent that it has learned what humans expect intelligent responses to look like. This is a genuine achievement, but it is not the achievement it appears to be.

Benchmarks formalize and industrialize the Turing structure.We evaluate outputs against expectations, and we interpret match as evidence of the capability that would, in humans, produce such outputs. The inference is imo. unwarranted. We are measuring the fit between output distributions, what the model produces and what we expect, not the processes that generate them.

## II. What Is a Language Model?
Before asking what benchmarks measure, we must ask what they measure *about*.

A large language model is a probability distribution over token sequences, conditioned on preceding tokens. Given a sequence of tokens, the model assigns probabilities to possible continuations. Generation proceeds by sampling from this distribution, one token at a time, each new token becoming part of the conditioning context for the next.They use a series of layers that have been termed transformers, which is an elaborate mechanism used to determine which parts of text to "attend" to and which ones to forget more easily (see how we are starting to borrow the vocabulary of cognitive science already). This was a breakthrough because in previous recursive architectures we had scheduled memory loss and later LSTM gates, but they were not nearly as accurate as the transformer block. This is the entire mechanism. There is no reasoning module, no comprehension unit, no world model in any architectural sense. There is a function—massively parameterized, trained on enormous corpora—that maps contexts to probability distributions over next tokens.

When we say a model "reasons" or "understands" or "knows," we are speaking metaphorically, and the metaphor is misplaced. The model does not reason; it assigns probabilities shaped by patterns in training data. It does not understand; it maps sequences to sequences in ways that preserve statistical regularities. It does not know; it encodes distributional information about token co-occurrence. It's in some sense a complicated and weighted lookup table.

The outputs *look* like reasoning because the training data contains text sequences signalling reasoning. The model has learned the statistical signature of argumentative text, explanatory text, problem-solving text. When prompted appropriately or RL tuned accordingly, it generates sequences that bear this signature. Within the distribution of training data, these sequences are often correct, coherent, useful. Outside that distribution, they degrade—sometimes gracefully, sometimes catastrophically.

Zhao et al. (2025) make this precise. They propose that chain-of-thought reasoning—the step-by-step explanations that make models appear to think—reflects "a structured inductive bias learned from in-distribution data, enabling models to conditionally generate reasoning trajectories that approximate those observed during training" (p. 2). Using a controlled environment called DataAlchemy, they trained language models from scratch and systematically probed them under various distribution conditions. The results are unambiguous: chain-of-thought reasoning functions when test conditions match training conditions. When they diverge even moderately—in task structure, reasoning length, or query format—performance collapses. Models produce, in the researchers' words, "fluent yet logically inconsistent reasoning steps" (p. 8).

The model has learned how reasoning *looks*—its linguistic form, its sequential structure, its rhetorical patterns. It reproduces this form. When the test case resembles training cases, the reproduction yields correct answers. When it does not, the form persists but the content fails. This is pattern matching, not inference. The distinction matters because pattern matching has different failure modes than reasoning. A reasoner who grasps a principle can apply and generalize it to novel cases. A pattern matcher who has learned the statistical signature of principle-application can reproduce that signature only where the statistics hold.The model has been test cramming for its exam.

## III. The Confabulating Witness
If outputs cannot reliably indicate the underlying process, perhaps explanations can. The chain-of-thought was supposed to provide transparency: if the model articulates its reasoning, we can check whether the reasoning is sound. We can look inside, only that we cannot.

Chen et al. (2025), in research conducted at Anthropic, tested whether reasoning models accurately verbalize their reasoning processes. They provided models with hints about correct answers—sometimes neutral ("a Stanford Professor indicates the answer is A"), sometimes concerning (information obtained through "unauthorized access")—and then examined whether the models acknowledged using these hints in their chain-of-thought explanations. The results undermine any simple faith in model transparency. Claude 3.7 Sonnet mentioned the hint only 25% of the time when it used the hint to change its answer. DeepSeek R1 mentioned it 39% of the time. The majority of explanations were unfaithful—they did not reflect the actual basis for the model's response. And faithfulness was lower on more difficult questions, precisely where we would most want to trust the explanation.

The chain-of-thought is not a window onto process. It is another output, generated by the same distributional machinery, optimized for the same objective: producing text that humans find plausible. The explanation does not reveal reasoning; it mimicries reasoning. This finding has epistemological consequences that extend beyond AI safety. If we cannot trust the model's account of its own reasoning, then we cannot use that account to validate benchmark performance. A model that scores 95% on a medical reasoning benchmark while producing elaborate chain-of-thought explanations may be reasoning, or may be pattern-matching while generating post-hoc rationalizations that look like reasoning. The output provides no basis for distinguishing these cases and moreover the surface of reasoning facilitates trust where we should exercise clinical precision caution.

## IV. The Fallacy of Misplaced Concreteness
Alfred North Whitehead identified a persistent error in scientific thought: the tendency to mistake abstractions for concrete realities. He called it the "fallacy of misplaced concreteness":

> There is an error; but it is merely the accidental error of mistaking the abstract for the concrete. This fallacy is the occasion of great confusion in philosophy. (Whitehead, 1925, p. 51)

The fallacy operates whenever we treat a model, a metric, or a measurement as though it were the thing itself. The map is confused with the territory. The abstraction, which was constructed to capture certain features of reality while ignoring others, comes to be seen as more real than the complex, contextual, relational phenomena it was meant to represent.

Whitehead also warned:

> The aim of science is to seek the simplest explanations of complex facts. We are apt to fall into the error of thinking that the facts are simple because simplicity is the goal of our quest. (Whitehead, 1925, p. 163)

Benchmark scores exhibit this fallacy in pure form. We wish to know whether a language model can reason about medical problems. We cannot measure reasoning directly—it is not the kind of thing that admits direct measurement. So we construct a proxy: performance on exam questions. The proxy produces a number. The number is reported, compared, optimized. In time, the number comes to stand for the capability itself. "GPT-4 achieves 96% on medical reasoning."

But the score is not an independent property of the model, it is relational. Sclar et al. (2024) demonstrated this with uncomfortable clarity: several widely-used open-source LLMs show performance differences of up to 76 accuracy points in response to subtle changes in prompt formatting semantically identical questions differing only in surface presentation. LLaMA-2-13B might score 20% or 96% depending on how the question is formatted. The "capability" that the benchmark purports to measure does not exist as a stable property of the model; it emerges from the interaction between model, prompt, and evaluation protocol and dataset. Change any element and the number changes. The abstraction has no existence apart from the concrete circumstances that produce it.

The medical domain makes this vivid. A systematic review of 39 medical LLM benchmarks found that knowledge-based benchmarks yield 70-79% mean accuracy, while practice-based benchmarks show 46-70% mean performance (Schwartz et al., 2025). When researchers moved from exam-style questions to multi-turn patient dialogues, diagnostic accuracy dropped from 82% to 62.7%—a 19.3 percentage point decrease (Johri et al., 2025). The model that "knows medicine" at 90% accuracy on licensing exams struggles to conduct a clinical conversation. The benchmark measured something; it did not measure what we thought.

Only 5% of 761 LLM evaluation studies assessed performance on real patient care data (Schwartz et al., 2025). The vast majority relied on medical examination questions that may not reflect actual clinical competence. We have been measuring exam-taking ability and calling it medical reasoning. The simplicity of the score seduced us into believing the capability was equally applicable.

## V. The Proxy Problem
The situation parallels a long-standing difficulty in my home discipline - psychology.

Psychological constructs—intelligence, depression, personality traits—are not directly observable. To study them empirically, researchers operationalize: they construct instruments that produce quantifiable outputs presumed to track the construct of interest. A depression inventory asks about sleep, appetite, mood, concentration. Responses are recorded on Likert scales, summed or averaged, treated statistically.

The question of whether the instrument validly captures the construct is the question of construct validity. It is, in principle, the central methodological question. In practice, it recedes into the background. The instrument produces numbers. Numbers permit statistics. Statistics permit publication. The chain from construct to conclusion is assumed rather than examined, unless your job is to construct these instruments, but even then you have little control as to how your instrument is used correctly.

Alaa et al. (2025) make this connection explicit:

> Psychometrics has long tackled this challenge that machine learning is only now beginning to face: how to design tests that accurately measure latent constructs. We propose that machine learning take a cue from psychology and develop a new science of benchmarking, focused on creating principled tools to evaluate the construct validity of its benchmark datasets. (p. 2)

Their empirical validation is sobering. Using real-world clinical data from electronic health records, they tested whether performance on MedQA—a popular benchmark derived from USMLE questions—predicts diagnostic accuracy on actual patient cases. The correlation was weak. Models with top scores on the benchmark often performed poorly on real patient records. The benchmark was measuring something, but that something was not clinical reasoning capability.

The replication crisis in psychology revealed how fragile such chains can be. Effects that seemed robust dissolved under replication. The problem was not merely p-hacking or small samples, though these contributed. The deeper problem was that the link between operationalization and construct had never been adequately established. Researchers were measuring *something*—but the something was often an artifact of the instrument, the sampling, the context, rather than the psychological reality the construct named.

## VI. The Contamination of Measurement
There is a further problem, specific to machine learning: the training data may contain the test.

Zhang et al. (2024) created GSM1k, a novel dataset designed to mirror the style and complexity of GSM8k, the widely-used benchmark for grade school mathematics. Unlike GSM8k, which has been public for years and likely appears in training corpora, GSM1k was carefully held out. Same difficulty distribution. Same problem types. Same human solve rates. Different specific problems.

The results revealed systematic overfitting. Accuracy drops of up to 13% appeared across leading models. The Phi and Mistral model families showed consistent overfitting across almost all model sizes and versions. A positive correlation emerged between a model's likelihood of generating examples from GSM8k and its performance gap between the two benchmarks (Spearman's r² = 0.32), suggesting partial memorization of the test set.

What was reported as mathematical reasoning capability was, in part, recognition of familiar problems. The model had seen these questions before—not necessarily verbatim, but close enough that the statistical signature matched. The benchmark was not testing reasoning; it was testing memory for the training distribution.

Anthropics latest breakthrough of a fully AI generated linux kernel and c-compiler are not that impressive, given that the internet basically contains the documentation and full code of both. Also Studies show that one can generate a 99~ accurate reproduction of almost any book on the internet. LLMs are indeed … very expensive test crammers.

## VII. Induction Without Deduction
There is a deeper epistemological problem, and it concerns the logic of inquiry itself.

The empirical turn in the human sciences was a reaction against a certain way of academic inquiry, no more armchair theorizing, no more systems built on creating special vocabulary without substance, no more critical theory. We would ground claims in data, test hypotheses against observation, let evidence adjudicate between competing theories. Social sciences shall be normal "hard sciences".

The structure was hypothetico-deductive:

1. Theory generates hypothesis
2. Hypothesis yields prediction
3. Observation confirms or disconfirms prediction
4. Theory is retained, revised, or rejected

The critical feature is the *deductive* step: from hypothesis to prediction. This is what exposes the hypothesis to potential falsification. If the prediction fails, the hypothesis is in trouble. The data function as a test, an external authority that can say no.

What has emerged instead—particularly in the empirical social sciences and also in applied machine learning—is something different. Patterns are extracted from data and reported as findings. Correlations are computed because the data permit, not because theory motivates. The machinery of statistical inference is deployed, but the inferential logic is inverted. Instead of testing hypotheses against data, we induce patterns from data and call them conclusions. Science becomes a more of performative act to assert authority and credibility through presenting formulas, tables, plots.

Bean et al. (2025) documented this systematically. Their review of 445 LLM benchmarks from leading conferences—ICML, ICLR, NeurIPS, ACL, NAACL, EMNLP—found that "almost all articles have weaknesses in at least one area across phenomena, tasks, metrics, and claims" (p. 1). Only 16% used rigorous statistical methods to compare model performance. About half the benchmarks claimed to measure abstract constructs like "reasoning" or "safety" without offering clear definitions or operationalizations. 41% used artificial tasks, with 29% relying solely on them; only about 10% used real-world tasks. Over 80% used exact match scores, but only 16% applied statistical tests to determine whether differences between models were meaningful.

The numbers are produced. The numbers are published. The numbers are compared. But the deductive step—the moment where the induced pattern must face an independent test, where the hypothesis risks falsification—is absent. We have industrialized induction and called it science.

The irony in the context of language models is acute. We are using pattern-extraction methods to evaluate pattern-extraction systems. The evaluators and the evaluated share the same epistemic limitation: both can identify regularities in distributions, but neither has access to the underlying structure that would warrant generalization beyond the observed.

## VIII. The Degradation of Method
The problem runs deeper than missing deduction. What LLM benchmarks have inherited from the empirical social sciences is not merely an epistemological weakness but a set of bad practices—and they have made these practices worse.

The replication crisis in psychology revealed what happens when the machinery of inference is deployed without the discipline of inference. P-values were computed, significance was claimed, but the underlying phenomena often failed to replicate. The problem was not that researchers were dishonest; it was that the ritual of statistical testing had become detached from its epistemic function. One computed the numbers because one could compute the numbers, because publication required numbers, because the field had organized itself around numbers. Whether the numbers meant anything was a question often ignored.

LLM benchmarks do not merely inherit this problem. They intensify it by abandoning even the pretense of inferential statistics. Where psychological research at least performs the ritual of significance testing, however degraded that ritual has become, benchmark studies often dispense with it entirely. What remains is pure description: this model scored 87.3%, that model scored 84.1%. No confidence intervals. No tests of whether the difference exceeds chance. No analysis of variance sources. Just point estimates, snapshot comparisons, presented as though they spoke for themselves.

Consider what would be required for rigorous evaluation of a clinical application. One would need to expose the system to diverse tasks—not a single benchmark but a range of challenges that approximate the heterogeneity of real-world use. One would need repeated measurements to establish reliability, to distinguish stable performance from spurious correlations, to determine whether the system produces consistent outputs or fluctuates unpredictably. One would need variance decomposition: how much of the observed performance is attributable to the model, how much to the specific prompts, how much to the particular samples, how much to random noise? Without such decomposition, a benchmark score is uninterpretable—we cannot know whether we are measuring a property of the system or an artifact of the measurement conditions.

The absence of confidence intervals is particularly striking. Language models are, by design, probabilistic systems. They sample from distributions; their outputs vary stochastically. Run the same prompt twice and you may get different responses. This is not a bug but a feature of the architecture—temperature settings, sampling strategies, the inherent randomness of next-token prediction. In any domain where statistical noise is known to be substantial, standard practice requires quantifying uncertainty. Clinical trials report confidence intervals. Psychological studies report standard errors. Economic forecasts come with uncertainty bands. The purpose is elementary: to distinguish signal from noise, to know whether an observed difference is likely real or likely an artifact of sampling variability.

In LLM benchmarking, this practice is virtually absent. Bean et al. (2025) found that only 16% of benchmark studies applied statistical tests to compare models. Confidence intervals are rarely reported. The implicit assumption is that all variance is attributable to the model—that the score of 87.3% reflects a stable property of the system rather than an interaction between model, prompt, sample, and random seed. But this assumption is empirically false. We know from the sensitivity studies that prompt formatting alone can shift performance by 76 accuracy points (Sclar et al., 2024). We know from the contamination studies that familiarity with test items inflates scores by up to 13 percentage points (Zhang et al., 2024). We know from the distribution-shift studies that performance collapses outside the training distribution (Zhao et al., 2025).

The variance, in other words, is not all in the model. It is distributed across multiple sources: the model's parameters, certainly, but also the prompt's phrasing, the sample's composition, the overlap with training data, the random seed, the decoding strategy. A proper evaluation would decompose this variance—would estimate how much each factor contributes, would report uncertainty around the model-attributable component. Instead, the entire observed score is attributed to "the model," as though the model were a fixed quantity with a determinate capability, as though the benchmark were a transparent window onto that capability rather than a complex interaction between system and measurement apparatus.

This is not merely a technical oversight. It reflects a conceptual confusion about what is being measured. The benchmark score is treated as an intrinsic property of the model—"GPT-4 has 96% accuracy on MedQA"—when it is in fact a relational property, emerging from the intersection of model, benchmark, prompt, and context. The reification is complete: the abstraction has been mistaken for the concrete. Whitehead's fallacy, again.

None of the rigorous practices and computations we know from clinical studies is routinely applied to LLM evaluation. Benchmarks are run once. Comparisons are made without statistical tests. Variance is not decomposed. Reliability is not assessed. The conditions that would be considered minimally acceptable for evaluating a pharmaceutical intervention are simply not required for evaluating a system that may be deployed in medical diagnosis, legal advice, educational assessment, or mental health support.

The charity interpretation is that the field is young and practices will mature. The less charitable interpretation is that rigor is inconvenient. Rigorous evaluation takes time, requires multiple runs, demands statistical sophistication, and may produce results less flattering to the systems under test.

There is a further question that benchmark studies rarely confront: what, exactly, is being measured? Perhaps what benchmarks measure is not capability at all, but something else: the degree to which the model's training distribution overlaps with the benchmark distribution, or the plausibility of its outputs to human evaluators, or simply its ability to pattern-match on familiar problems. If benchmarks measure plausibility rather than capability, then the entire evaluative enterprise is dispensible. We would be optimizing for the appearance of competence rather than competence itself, training systems to produce outputs that humans find convincing, regardless of whether those outputs are correct, reliable, or grounded in anything we would recognize as understanding. The Turing test, again, but industrialized and quantified. The inductive turn does not eliminate the appearance of rigor. It relocates rigor to the surface while quietly substituting the underlying process, a bit like an LLM.

## References
Alaa, A., Chen, R. J., Badgeley, M. A., Chen, J. H., Dagan, N., Daneshjou, R., Eriksson, J. A., Ghassemi, M. M., Ho, J., Kuo, P.-C., Liang, H., Pierson, E., Rajpurkar, P., Sontag, D., Steinberg, E., Van Veen, D., & Wiens, J. (2025). Medical large language model benchmarks should prioritize construct validity. *arXiv*. https://arxiv.org/abs/2503.10694

Bean, A., Brennan, I., Buçinca, Z., Creel, K., Dafoe, A., DeGrave, A., Dreyling, L., Eifler, C., Evans, O., Fernando, C., Ganguli, D., Garbe, L., Goldstein, A., Haduong, A., Hase, P., Ho, J., Hubinger, E., Jones, A., Kenton, Z., … Zhuang, S. (2025). Measuring what matters: Construct validity in large language model benchmarks. *OpenReview*. https://openreview.net/forum?id=mdA5lVvNcU

Chen, W., Gao, Y., & Liu, Z. (2025). Evaluating the robustness of large language model safety guardrails. *arXiv*. https://arxiv.org/abs/2511.22047

Chen, Y., Sattigeri, P., Wu, T., Wang, D., Wornow, M., Ustun, A., Bansal, H., Shah, J., Guestrin, C., Wei, J., Bastings, J., Naik, A., Huang, S., Bowman, S. R., & Perez, E. (2025). Reasoning models don't always say what they think. *arXiv*. https://arxiv.org/abs/2505.05410

Chung, P., Zaidi, S., Gkotsis, G., Kormilitzin, A., Nevado-Holgado, A., & Gao, J. (2025). Limitations of large language models in clinical problem-solving arising from inflexible reasoning. *Scientific Reports, 15*, Article 22940. https://doi.org/10.1038/s41598-025-22940-0

Johri, S., Jeong, J., Tran, B., Schlessinger, D. I., Wongvibulsin, S., Barnes, L. A., Hong, C., Celi, L. A., Daneshjou, R., & Rajpurkar, P. (2025). CRAFT-MD: A conversational evaluation benchmark for clinical reasoning. *Nature Medicine, 31*, 1217–1224.

Sclar, M., Choi, Y., Tsvetkov, Y., & Suhr, A. (2024). Quantifying language models' sensitivity to spurious features in prompt design or: How I learned to start worrying about prompt formatting. *Proceedings of the Twelfth International Conference on Learning Representations*.

Schwartz, D., Okolo, C., Lehman, E., & Rajpurkar, P. (2025). Knowledge-practice performance gap in clinical large language models: Systematic review of 39 benchmarks. *Journal of Medical Internet Research, 27*(1), e84120. https://doi.org/10.2196/84120

Whitehead, A. N. (1925). *Science and the modern world*. The Free Press.

Zhang, H., Da, J., Lee, D., Robinson, V., Wu, C., Song, W., Zhao, T., Raja, P., Slack, D., Guo, Q., Krause, A., & Brandfonbrener, D. (2024). A careful examination of large language model performance on grade school arithmetic. *arXiv*. https://arxiv.org/abs/2405.00332

Zhao, C., Tan, Z., Ma, P., Li, D., Jiang, B., Wang, Y., Yang, Y., & Liu, H. (2025). Is chain-of-thought reasoning of LLMs a mirage? A data distribution lens. *arXiv*. https://arxiv.org/abs/2508.01191
