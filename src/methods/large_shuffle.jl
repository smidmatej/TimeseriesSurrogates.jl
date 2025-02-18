export BlockShuffle, CycleShuffle, CircShift

#########################################################################
# BlockSuffle
#########################################################################
function get_uniform_blocklengths(L::Int, n::Int)
    # Compute block lengths
    N = floor(Int, L/n)
    R = L % n
    blocklengths = [N for i = 1:n]
    for i = 1:R
        blocklengths[i] += 1
    end
    return blocklengths
end

"""
    BlockShuffle(n::Int; shift = false)

A block shuffle surrogate constructed by dividing the time series
into `n` blocks of roughly equal width at random indices (end
blocks are wrapped around to the start of the time series).

If `shift` is `true`, then the input signal is circularly shifted by a 
random number of steps prior to picking blocks.

Block shuffle surrogates roughly preserve short-range temporal properties
in the time series (e.g. correlations at lags less than the block length),
but break any long-term dynamical information (e.g. correlations beyond
the block length).

Hence, these surrogates can be used to test any null hypothesis aimed at
comparing short-range dynamical properties versus long-range dynamical
properties of the signal.
"""
struct BlockShuffle{I <: Integer, B <: Bool} <: Surrogate
    n::I
    shift::B

    function BlockShuffle(n::I; shift::B = false) where {I <: Integer, B <: Bool}
        return new{I, B}(n, shift)
    end

    # Split time series into 10 pieces by default. Shifting disabled by default.
    function BlockShuffle()
        return new{Int, Bool}(10, false)
    end
end

function surrogenerator(x::AbstractVector, bs::BlockShuffle, rng = Random.default_rng())
    bs.n < length(x) || error("The number of blocks exceeds number of available points")

    # The lengths of the blocks (one block will have a differing length if length of 
    # time series in not a multiple of the number of blocks, so )
    blocklengths = get_uniform_blocklengths(length(x), bs.n)

    # The start index of each block.
    startinds = vcat(1, cumsum(blocklengths) .+ 1)

    # The data from which we will sample. This array may be circularly shifted.
    x_rotated = copy(x)

    # The order in which we will draw the blocks. Will be shuffled every time 
    # a new surrogate is generated.
    draw_order = collect(1:bs.n)

    init = (
        blocklengths = blocklengths, 
        startinds = startinds,
        x_rotated = x_rotated,
        draw_order = draw_order,
    )

    # The surrogate.
    s = similar(x)

    return SurrogateGenerator(bs, x, s, init, rng)
end

function (sg::SurrogateGenerator{<:BlockShuffle})()
    init_fields = (:blocklengths, :startinds, :x_rotated, :draw_order)
    blocklengths, startinds, x_rotated, draw_order = getfield.(Ref(sg.init), init_fields)
    x, s, n = sg.x, sg.s, sg.method.n

    # Circular shift, if desired
    if sg.method.shift
        circshift!(x_rotated, x, rand(sg.rng, 1:length(x)))
    end

    # Shuffle blocks
    shuffle!(sg.rng, draw_order)

    k = 1
    npts_sampled = 0
    for i in draw_order
        # The index of the data point which this block starts (in `x_rotated`)
        sᵢ = startinds[i]

        # The length of this block.
        l = blocklengths[i]
        
        # Indices of the block which is sampled.
        ix_from = sᵢ:(sᵢ + l - 1)

        # Indices in `s` into which this block will be placed.
        ix_into = (npts_sampled + 1):(npts_sampled + 1 + l - 1)
        
        # Do the assignment in-place behind a code barrier. This about
        # 3x as efficients as doing an elementwise assignment and 
        # doesn't allocate.
        assign_block_to_surrogate!(s, x_rotated, ix_into, ix_from)

        npts_sampled += l
    end
    #@assert all(sort(s) .== sort(x_rotated))
    return s
end

function assign_block_to_surrogate!(s, x_rotated, ix_into, ix_from)
    @assert length(ix_into) == length(ix_from)
    n = length(ix_into)
    @inbounds for k = 1:n
        ito = ix_into[k]
        ifr = ix_from[k]
        s[ito] = x_rotated[ifr]
    end
end

#########################################################################
# CycleShuffle
#########################################################################
"""
    CycleShuffle(n::Int = 7, σ = 0.5)

Cycle shuffled surrogates[^Theiler1994] that identify successive local peaks in the data and shuffle the
cycles in-between the peaks. Similar to [`BlockShuffle`](@ref), but here
the "blocks" are defined as follows:
1. The timeseries is smoothened via convolution with a Gaussian (`DSP.gaussian(n, σ)`).
2. Local maxima of the smoothened signal define the peaks, and thus the blocks in between them.
3. The first and last index of timeseries can never be peaks and thus signals that
   should have peaks very close to start or end of the timeseries may not perform well. In addition,
   points before the first or after the last peak are never shuffled.
3. The defined blocks are randomly shuffled as in [`BlockShuffle`](@ref).

CSS are used to test the null hypothesis that the signal is generated by a periodic
oscillator with no dynamical correlation between cycles,
i.e. the evolution of cycles is not deterministic.

See also [`PseudoPeriodic`](@ref).

[^Theiler1994]: J. Theiler, On the evidence for low-dimensional chaos in an epileptic electroencephalogram, [Phys. Lett. A 196](https://doi.org/10.1016/0375-9601(94)00856-K)
"""
struct CycleShuffle{T <: AbstractFloat} <: Surrogate
    n::Int
    σ::T
end
CycleShuffle(n = 7, σ = 0.5) = CycleShuffle{typeof(σ)}(n, σ)

function surrogenerator(x::AbstractVector, cs::CycleShuffle, rng = Random.default_rng())
    n, N = cs.n, length(x)
    g = DSP.gaussian(n, cs.σ)
    smooth = DSP.conv(x, g)
    r = length(smooth) - N
    smooth = iseven(r) ? smooth[r÷2+1:end-r÷2] : smooth[r÷2+1:end-r÷2-1]
    peaks = findall(i -> smooth[i-1] < smooth[i] && smooth[i] > smooth[i+1], 2:N-1)
    blocks = [collect(peaks[i]:peaks[i+1]-1) for i in 1:length(peaks)-1]
    init =  (blocks = blocks, peak1 = peaks[1])
    s = copy(x)
    SurrogateGenerator(cs, x, s, init, rng)
end

function (sg::SurrogateGenerator{<:CycleShuffle})()
    blocks, peak1 = sg.init
    x = sg.x
    s = sg.s
    shuffle!(sg.rng, blocks)
    i = peak1
    for b in blocks
        s[(0:length(b)-1) .+ i] .= @view x[b]
        i += length(b)
    end
    return s
end

#########################################################################
# Timeshift
#########################################################################
random_shift(n::Integer, rng) = n
random_shift(n::AbstractVector{<:Integer}, rng) = rand(rng, n)

"""
    CircShift(n)
Surrogates that are circularly shifted versions of the original timeseries.

`n` can be an integer (the surrogate is the original time series shifted 
by `n` indices), or any vector of integers, which which means that each 
surrogate is shifted by an integer selected randomly among the entries in `n`.
"""
struct CircShift{N} <: Surrogate
    n::N
end

function surrogenerator(x, sd::CircShift, rng = Random.default_rng())
    return SurrogateGenerator(sd, x, similar(x), nothing, rng)
end

function (sg::SurrogateGenerator{<:CircShift})()
    x, s = sg.x, sg.s
    shift = random_shift(sg.method.n, sg.rng)
    circshift!(s, x, shift)

    return s
end