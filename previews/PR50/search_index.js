var documenterSearchIndex = {"docs":
[{"location":"constrained/randomshuffle/#Shuffle-based-1","page":"Shuffle-based","title":"Shuffle-based","text":"","category":"section"},{"location":"constrained/randomshuffle/#Random-shuffle-(RS)-1","page":"Shuffle-based","title":"Random shuffle (RS)","text":"","category":"section"},{"location":"constrained/randomshuffle/#","page":"Shuffle-based","title":"Shuffle-based","text":"Randomly shuffled surrogates are simply permutations of the original time series.","category":"page"},{"location":"constrained/randomshuffle/#","page":"Shuffle-based","title":"Shuffle-based","text":"Thus, they break any correlations in the signal.","category":"page"},{"location":"constrained/randomshuffle/#","page":"Shuffle-based","title":"Shuffle-based","text":"using TimeseriesSurrogates, Plots\nx = AR1() # create a realization of a random AR(1) process\nphases = true\ns = surrogate(x, RandomShuffle())\n\nsurroplot(x, s)","category":"page"},{"location":"constrained/randomshuffle/#Block-shuffle-(BS))-1","page":"Shuffle-based","title":"Block shuffle (BS))","text":"","category":"section"},{"location":"constrained/randomshuffle/#","page":"Shuffle-based","title":"Shuffle-based","text":"Randomly shuffled surrogates are generated by dividing the original signal into blocks, then permuting those blocks. Block positions are randomized, and blocks at the end of the signal gets wrapped around to the start of the time series.","category":"page"},{"location":"constrained/randomshuffle/#","page":"Shuffle-based","title":"Shuffle-based","text":"Thus, they keep short-term correlations within blocks, but destroy any long-term dynamical information in the signal.","category":"page"},{"location":"constrained/randomshuffle/#","page":"Shuffle-based","title":"Shuffle-based","text":"using TimeseriesSurrogates, Plots\nx = NSAR2(n_steps = 300)\n\n# We want to divide the signal into 8 blocks.\ns = surrogate(x, BlockShuffle(8))\nsurroplot(x, s)","category":"page"},{"location":"constrained/truncated_fourier_transform/#Truncated-FT/AAFT-surrogates-1","page":"Truncated FT/AAFT surrogates","title":"Truncated FT/AAFT surrogates","text":"","category":"section"},{"location":"constrained/truncated_fourier_transform/#","page":"Truncated FT/AAFT surrogates","title":"Truncated FT/AAFT surrogates","text":"TFTS","category":"page"},{"location":"constrained/truncated_fourier_transform/#TimeseriesSurrogates.TFTS","page":"Truncated FT/AAFT surrogates","title":"TimeseriesSurrogates.TFTS","text":"TFTS(fϵ::Real)\n\nA truncated Fourier transform surrogate[Nakamura2006] (TFTS). These surrogates were  designed to deal with data with irregular fluctuations superimposed over long  term trends, and are generated by leaving a fraction of the lower frequencies untouched  when performing the phase shuffling step (as opposed to randomizing all frequencies, like in RandomFourier surrogates).\n\nThe truncation parameter fϵ is the ratio of the high frequency domain to the  whole frequency domain. For example, if the number of frequencies is 2000 and frequencies between 1500 and 2000 are to be  randomized, then fϵ = 500/2000 = 0.25. The appropriate value of fϵ strongly  depends on the data and time series length, and must be manually determined[Nakamura2006], for example by comparing periodograms for the time series and the surrogates.\n\nThe TFTS surrogate can be used to test the null hypothesis that the signal is  a stationary linear system generated the irregular fluctuations part of the signal[Nakamura2006].\n\nThe by changing the sign of fϵ, the implementation here also allows for truncating  at the opposite end of the spectrum. Thus, negative values of fϵ will leave  the lower frequencies intact and shuffle the higher frequencies (the absolute value  of fϵ still refers to the fraction of high frequency domain to total frequency domain).\n\n[Nakamura2006]: Nakamura, Tomomichi, Michael Small, and Yoshito Hirata. \"Testing for nonlinearity in irregular fluctuations with long-term trends.\" Physical Review E 74.2 (2006): 026205.\n\n\n\n\n\n","category":"type"},{"location":"constrained/truncated_fourier_transform/#","page":"Truncated FT/AAFT surrogates","title":"Truncated FT/AAFT surrogates","text":"TAAFT","category":"page"},{"location":"constrained/truncated_fourier_transform/#TimeseriesSurrogates.TAAFT","page":"Truncated FT/AAFT surrogates","title":"TimeseriesSurrogates.TAAFT","text":"TAAFT(fϵ)\n\nAn truncated version of the amplitude-adjusted-fourier-transform surrogate[^Theiler1992, ^Nakamura2006].\n\nThe truncation parameter and phase randomization procedure is identical to TFTS, but here an  additional step of rescaling back to the original data is performed. This preserves the  amplitude distribution of the original data.\n\nReferences\n\n[Theiler1992]: J. Theiler et al., Physica D 58 (1992) 77-94 (1992)](https://www.sciencedirect.com/science/article/pii/016727899290102S)\n\n[Nakamura2006]: Nakamura, Tomomichi, Michael Small, and Yoshito Hirata. \"Testing for nonlinearity in irregular fluctuations with long-term trends.\" Physical Review E 74.2 (2006): 026205.\n\n\n\n\n\n","category":"type"},{"location":"constrained/pps/#Pseudo-periodic-1","page":"Pseudo-periodic","title":"Pseudo-periodic","text":"","category":"section"},{"location":"constrained/pps/#","page":"Pseudo-periodic","title":"Pseudo-periodic","text":"using TimeseriesSurrogates, Plots\nt = 0:0.05:20π\nx = @. 4 + 7cos(t) + 2cos(2t + 5π/4)\nx .+= randn(length(x))*0.2\n\n# Optimal d, τ values deduced using DynamicalSystems.jl\nd, τ = 3, 31\n\n# For ρ you can use `noiseradius`\nρ = 0.11\n\nmethod = PseudoPeriodic(d, τ, ρ, false)\ns = surrogate(x, method)\nsurroplot(x, s)","category":"page"},{"location":"man/exampleprocesses/#Example-processes-1","page":"Utility systems","title":"Example processes","text":"","category":"section"},{"location":"man/exampleprocesses/#","page":"Utility systems","title":"Utility systems","text":"SNLST\nrandomwalk\nNSAR2\nAR1","category":"page"},{"location":"man/exampleprocesses/#TimeseriesSurrogates.SNLST","page":"Utility systems","title":"TimeseriesSurrogates.SNLST","text":"SNLST(n_steps, x₀, k)\n\nDynamically linear process transformed by a strongly nonlinear static transformation (SNLST)[1].\n\nEquations\n\nThe system is by the following map:\n\nx(t) = k x(t-1) + a(t)\n\nwith the transformation s(t) = x(t)^3.\n\nReferences\n\n[1]: Lucio et al., Phys. Rev. E 85, 056202 (2012). https://journals.aps.org/pre/abstract/10.1103/PhysRevE.85.056202\n\n\n\n\n\n","category":"function"},{"location":"man/exampleprocesses/#TimeseriesSurrogates.randomwalk","page":"Utility systems","title":"TimeseriesSurrogates.randomwalk","text":"randomwalk(n_steps, x₀)\n\nLinear random walk (AR(1) process with a unit root)[1]. This is an example of a nonstationary linear process.\n\nReferences\n\n[1]: Lucio et al., Phys. Rev. E 85, 056202 (2012). https://journals.aps.org/pre/abstract/10.1103/PhysRevE.85.056202\n\n\n\n\n\n","category":"function"},{"location":"man/exampleprocesses/#TimeseriesSurrogates.NSAR2","page":"Utility systems","title":"TimeseriesSurrogates.NSAR2","text":"NSAR2(n_steps, x₀, x₁)\n\nCyclostationary AR(2) process[1].\n\nReferences\n\n[1]: Lucio et al., Phys. Rev. E 85, 056202 (2012). https://journals.aps.org/pre/abstract/10.1103/PhysRevE.85.056202\n\n\n\n\n\n","category":"function"},{"location":"man/exampleprocesses/#TimeseriesSurrogates.AR1","page":"Utility systems","title":"TimeseriesSurrogates.AR1","text":"AR1(n_steps, x₀, k)\n\nSimple AR(1) model with no static transformation[1].\n\nEquations\n\nThe system is given by the following map:\n\nx(t+1) = k x(t) + a(t)\n\nwhere a(t) is a draw from a normal distribution with zero mean and unit variance. x₀ sets the initial condition and k is the tunable parameter in the map.\n\nReferences\n\n[1]: Lucio et al., Phys. Rev. E 85, 056202 (2012). https://journals.aps.org/pre/abstract/10.1103/PhysRevE.85.056202\n\n\n\n\n\n","category":"function"},{"location":"constrained/fourier_surrogates/#Fourier-based-1","page":"Fourier-based","title":"Fourier-based","text":"","category":"section"},{"location":"constrained/fourier_surrogates/#","page":"Fourier-based","title":"Fourier-based","text":"Fourier based surrogates are a form of constrained surrogates created by taking the Fourier transform of a time series, then shuffling either the phase angles or the amplitudes of the resulting complex numbers. Then, we take the inverse Fourier transform, yielding a surrogate time series.","category":"page"},{"location":"constrained/fourier_surrogates/#Random-phase-1","page":"Fourier-based","title":"Random phase","text":"","category":"section"},{"location":"constrained/fourier_surrogates/#","page":"Fourier-based","title":"Fourier-based","text":"using TimeseriesSurrogates, Plots\nts = AR1() # create a realization of a random AR(1) process\nphases = true\ns = surrogate(ts, RandomFourier(phases))\n\nsurroplot(ts, s)","category":"page"},{"location":"constrained/fourier_surrogates/#Random-amplitude-1","page":"Fourier-based","title":"Random amplitude","text":"","category":"section"},{"location":"constrained/fourier_surrogates/#","page":"Fourier-based","title":"Fourier-based","text":"using TimeseriesSurrogates, Plots\nts = AR1() # create a realization of a random AR(1) process\nphases = false\ns = surrogate(ts, RandomFourier(phases))\n\nsurroplot(ts, s)","category":"page"},{"location":"constrained/amplitude_adjusted/#Amplitude-adjusted-Fourier-transform-surrogates-1","page":"Amplitude-adjusted FT","title":"Amplitude adjusted Fourier transform surrogates","text":"","category":"section"},{"location":"constrained/amplitude_adjusted/#AAFT-1","page":"Amplitude-adjusted FT","title":"AAFT","text":"","category":"section"},{"location":"constrained/amplitude_adjusted/#","page":"Amplitude-adjusted FT","title":"Amplitude-adjusted FT","text":"using TimeseriesSurrogates, Plots\nts = AR1() # create a realization of a random AR(1) process\ns = surrogate(ts, AAFT())\n\nsurroplot(ts, s)","category":"page"},{"location":"constrained/amplitude_adjusted/#IAAFT-1","page":"Amplitude-adjusted FT","title":"IAAFT","text":"","category":"section"},{"location":"constrained/amplitude_adjusted/#","page":"Amplitude-adjusted FT","title":"Amplitude-adjusted FT","text":"The IAAFT surrogates add an iterative step to the AAFT algorithm improve convergence.","category":"page"},{"location":"constrained/amplitude_adjusted/#","page":"Amplitude-adjusted FT","title":"Amplitude-adjusted FT","text":"using TimeseriesSurrogates, Plots\nts = AR1() # create a realization of a random AR(1) process\ns = surrogate(ts, IAAFT())\n\nsurroplot(ts, s)","category":"page"},{"location":"#Overview-1","page":"Overview","title":"Overview","text":"","category":"section"},{"location":"#TODO:-add-example-figure-here.-1","page":"Overview","title":"TODO: add example figure here.","text":"","category":"section"},{"location":"#","page":"Overview","title":"Overview","text":"If you are new to this method of surrogate time series, feel free to read any of the following:","category":"page"},{"location":"#","page":"Overview","title":"Overview","text":"The method of surrogate testing\nWhat is a surrogate time series?\nTypes of surrogate realizations","category":"page"},{"location":"#API-1","page":"Overview","title":"API","text":"","category":"section"},{"location":"#","page":"Overview","title":"Overview","text":"TimeseriesSurrogates.jl exports two main functions. Both of them dispatch on the chosen method, a subtype of Surrogate.","category":"page"},{"location":"#","page":"Overview","title":"Overview","text":"surrogate\nsurrogenerator","category":"page"},{"location":"#TimeseriesSurrogates.surrogate","page":"Overview","title":"TimeseriesSurrogates.surrogate","text":"surrogate(x, method::Surrogate) → s\n\nCreate a single surrogate timeseries s from x based on the given method. If you want to generate more than one surrogates from x, you should use surrogenerator.\n\n\n\n\n\n","category":"function"},{"location":"#TimeseriesSurrogates.surrogenerator","page":"Overview","title":"TimeseriesSurrogates.surrogenerator","text":"surrogenerator(x, method::Surrogate) → sg::SurrogateGenerator\n\nInitialize a generator that creates surrogates of x on demand, based on given method. This is efficient, because for most methods some things can be initialized and reused for every surrogate.\n\nTo generate a surrogate, call sg as a function with no arguments, e.g.:\n\nsg = surrogenerator(x, method)\nfor i in 1:1000\n    s = sg()\n    # do stuff with s and or x\n    result[i] = stuff\nend\n\n\n\n\n\n","category":"function"},{"location":"#Surrogate-methods-1","page":"Overview","title":"Surrogate methods","text":"","category":"section"},{"location":"#","page":"Overview","title":"Overview","text":"RandomShuffle\nBlockShuffle\nRandomFourier\nAAFT\nIAAFT\nPseudoPeriodic","category":"page"},{"location":"#TimeseriesSurrogates.RandomShuffle","page":"Overview","title":"TimeseriesSurrogates.RandomShuffle","text":"RandomShuffle() <: Surrogate\n\nA random constrained surrogate, generated by shifting values around.\n\nThis method destroys any linear correlation in the signal, but preserves its amplitude distribution.\n\n\n\n\n\n","category":"type"},{"location":"#TimeseriesSurrogates.BlockShuffle","page":"Overview","title":"TimeseriesSurrogates.BlockShuffle","text":"BlockShuffle(n::Int) <: Surrogate\n\nA block shuffle surrogate constructed by dividing the time series into n blocks of roughly equal width at random indices (end blocks are wrapped around to the start of the time series).\n\nThese surrogates preserve short-term correlations in the time series, but break any long-term dynamical information.\n\n\n\n\n\n","category":"type"},{"location":"#TimeseriesSurrogates.RandomFourier","page":"Overview","title":"TimeseriesSurrogates.RandomFourier","text":"RandomFourier(phases = true) <: Surrogate\n\nA surrogate[Theiler1992] that randomizes the Fourier components of the signal in some manner. If phases==true, the phases are randomized, otherwise the amplitudes are randomized.\n\nIf phases==true, then the resulting signal has same linear correlation, or periodogram, as the original data.\n\n#TODO: Okay, what happens if phases!=true ?\n\n[Theiler1992]: J. Theiler et al., Physica D 58 (1992) 77-94 (1992)\n\n\n\n\n\n","category":"type"},{"location":"#TimeseriesSurrogates.AAFT","page":"Overview","title":"TimeseriesSurrogates.AAFT","text":"AAFT()\n\nAn amplitude-adjusted-fourier-transform surrogate[Theiler1992].\n\nAAFT have the same linear correlation, or periodogram, and also preserves the amplitude distribution of the original data.\n\n\n\n\n\n","category":"type"},{"location":"#TimeseriesSurrogates.IAAFT","page":"Overview","title":"TimeseriesSurrogates.IAAFT","text":"IAAFT(M = 100, tol = 1e-6, W = 75)\n\nAn iteratively adjusted amplitude-adjusted-fourier-transform surrogate[SchreiberSchmitz1996].\n\nIAAFT surrogate have the same linear correlation, or periodogram, and also preserves the amplitude distribution of the original data, but are improved relative to AAFT through iterative adjustment (which runs for a maximum of M steps). During the iterative adjustment, the periodograms of the original signal and the surrogate are coarse-grained and the powers are averaged over W equal-width frequency bins. The iteration procedure ends when the relative deviation between the periodograms is less than tol (or when M is reached).\n\nReferences\n\n[SchreiberSchmitz1996]: T. Schreiber; A. Schmitz (1996). \"Improved Surrogate Data for Nonlinearity Tests\". Phys. Rev. Lett. 77 (4)\n\n\n\n\n\n","category":"type"},{"location":"#TimeseriesSurrogates.PseudoPeriodic","page":"Overview","title":"TimeseriesSurrogates.PseudoPeriodic","text":"PseudoPeriodic(d, τ, ρ, shift=true) <: Surrogate\n\nCreate surrogates suitable for pseudo-periodic signals. They retain the periodic structure of the signal, while inter-cycle dynamics that are either deterministic or correlated noise are destroyed (for appropriate ρ choice). Therefore these surrogates are suitable to test the null hypothesis that the signal is periodic with uncorrelated noise[Small2001].\n\nArguments d, τ, ρ are as in the paper, the embedding dimension, delay time and noise radius. The method works by performing a delay coordinates ambedding via the library DynamicalSystems.jl. See its documentation for choosing appropriate values for d, τ. For ρ, we have implemented the method proposed in the paper in the function noiseradius.\n\nThe argument shift is not discussed in the paper, but it is possible to adjust the algorithm so that there is no phase shift between the periodic component of the original and surrogate data.\n\n[Small2001]: Small et al., Surrogate test for pseudoperiodic time series data, Physical Review Letters, 87(18)\n\n\n\n\n\n","category":"type"},{"location":"#Utils-1","page":"Overview","title":"Utils","text":"","category":"section"},{"location":"#","page":"Overview","title":"Overview","text":"noiseradius","category":"page"},{"location":"#TimeseriesSurrogates.noiseradius","page":"Overview","title":"TimeseriesSurrogates.noiseradius","text":"noiseradius(x::AbstractVector, d::Int, τ, ρs, n = 1) → ρ\n\nUse the proposed* algorithm of[Small2001] to estimate optimal ρ value for PseudoPeriodic surrogates, where ρs is a vector of possible ρ values.\n\n*The paper is ambiguous about exactly what to calculate. Here we count how many times we have pairs of length-2 that are identical in x and its surrogate, but are not also part of pairs of length-3.\n\nThis function directly returns the arg-maximum of the evaluated distribution of these counts versus ρ, use TimeseriesSurrogates._noiseradius with same arguments to get the actual distribution. n means to repeat τhe evaluation n times, which increases accuracy.\n\n[Small2001]: Small et al., Surrogate test for pseudoperiodic time series data, Physical Review Letters, 87(18)\n\n\n\n\n\n","category":"function"},{"location":"#Visualization-1","page":"Overview","title":"Visualization","text":"","category":"section"},{"location":"#","page":"Overview","title":"Overview","text":"TimeseriesSurrogates.jl provides the function surroplot(x, s), which comes into scope when using Plots. This function is used in the example applications.","category":"page"},{"location":"man/whatisasurrogate/#What-is-a-surrogate?-1","page":"What is a surrogate?","title":"What is a surrogate?","text":"","category":"section"},{"location":"man/whatisasurrogate/#The-method-of-surrogate-testing-1","page":"What is a surrogate?","title":"The method of surrogate testing","text":"","category":"section"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"The method of surrogate testing[1]. is a statistical method for testing properties about a dynamical system whose governing equations is not known. This happens when the only information we have available about the system is a time series.","category":"page"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"Surrogate testing can be used to test, for example, the following properties about a data set or the underlying process[2]:","category":"page"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"does the dataset show evidence of nonlinearity?\ndoes the dataset show evidence of low-dimensional chaos?","category":"page"},{"location":"man/whatisasurrogate/#What-is-a-surrogate-time-series?-1","page":"What is a surrogate?","title":"What is a surrogate time series?","text":"","category":"section"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"Let's say we have a nontrivial time series, call it X, consisting of n observations. A surrogate time series for X is another time series of n values which (roughly) preserves one or many mathematical/statistical properties of X.","category":"page"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"The upper panel in the figure below shows an example of a time series (blue) and one surrogate realization that preserves its autocorrelation (orange).  The time series \"look alike\", which is due to the fact the surrogate realization almost exactly preserved the power spectrum and autocorrelation of the time series, as shown in the lower panels.","category":"page"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"using TimeseriesSurrogates\nx = LinRange(0, 20π, 300) .+ 0.05 .* rand(300)\nts = sin.(x./rand(20:30, 300) + cos.(x)) \ns = surrogate(ts, IAAFT())\n\nsurroplot(ts, s)","category":"page"},{"location":"man/whatisasurrogate/#Types-of-surrogate-realizations-1","page":"What is a surrogate?","title":"Types of surrogate realizations","text":"","category":"section"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"The preserved statistical properties can be anything, and must be decided based on which null hypothesis one wants to test for.","category":"page"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"Following the convention of Theiler and Prichard (1996), there are two main types of surrogates: constrained realizations and typical realizations.","category":"page"},{"location":"man/whatisasurrogate/#Constrained-realizations-1","page":"What is a surrogate?","title":"Constrained realizations","text":"","category":"section"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"The values of a constrained surrogate realization of a time series is just a shuffling of the values of the original time series. With TimeseriesSurrogates.jl, you can construct the following types of constrained surrogate realizations:","category":"page"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"Random shuffle surrogates. Destroys any linear correlation in the signal, but preserves its amplitude distribution.\nBlock shuffle surrogates. Keeps short-term correlations in the signal, but destroys any long-term correlation.\nFourier surrogates. Have the same linear correlation, or periodogram, as X.\nAmplitude adjusted Fourier transform surrogates. Have the same linear correlation and the amplitude distribution as X.","category":"page"},{"location":"man/whatisasurrogate/#Typical-realizations-1","page":"What is a surrogate?","title":"Typical realizations","text":"","category":"section"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"Typical surrogate realizations are not generated by a permutation of the original values of the time series. Rather, they are generated by fitting some model to the data (intented to capture some important property of the system), and then using that model to generate surrogate realizations of the time series.","category":"page"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"Pseudoperiodic surrogates. ","category":"page"},{"location":"man/whatisasurrogate/#Literature-references-1","page":"What is a surrogate?","title":"Literature references","text":"","category":"section"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"[1]: Theiler et al., Testing for nonlinearity in time series: the method of surrogate data, Physica D 58 (1992) 77-94.","category":"page"},{"location":"man/whatisasurrogate/#","page":"What is a surrogate?","title":"What is a surrogate?","text":"[2]: Theiler & Prichard, Constrained-realization Monte-Carlo method for hypothesis testing, Physica D 94 (1996) 221-235","category":"page"}]
}
