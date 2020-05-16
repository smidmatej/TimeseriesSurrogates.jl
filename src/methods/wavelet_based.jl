export WLS
using Wavelets

"""
    WLS(wt::Wavelets.WT.OrthoWaveletClass, surromethod::Surrogate)

A wavelet surrogate generated by taking the maximal overlap discrete 
wavelet transform (MODWT) of the signal, shuffling detail 
coefficients at each dyadic scale using the provided `surromethod`,
then taking the inverse transform to obtain a surrogate.

Based on Keylock (2006)[^Keylock2006], but in contrast to the original 
implementation, you may choose to use any surrogate method from this 
package to perform the randomization of the detail coefficients at each 
dyadic scale. The iterative steps after rank ordering (step [v] in [^Keylock2006])
are not performed in this implementation.

If `surromethod == IAAFT()`, the wavelet surrogates preserves the mean 
and variance structure of the signal, but randomises nonlinear 
properties of the signal (i.e. Hurst exponents)[^Keylock2006].

To deal with nonstationary signals, Keylock (2006) recommends using a 
wavelet with a high number of vanishing moments. Thus, default here is 
a Daubechies wavelet with 16 vanishing moments.

[^Keylock2006]: C.J. Keylock (2006). "Constrained surrogate time series with preservation of the mean and variance structure". Phys. Rev. E. 73: 036707. doi:10.1103/PhysRevE.73.036707.
"""
struct WLS <: Surrogate
    wt::Wavelets.WT.OrthoWaveletClass
    surromethod::Surrogate # should preserve values of the original series
end

# Keylock (2006) recommends a wavelet with high number of vanishing moments,
# so use Daubechies wavelets with 16 vanishing moments as default.
WLS() = WLS(Wavelets.WT.Daubechies{16}(), AAFT())
WLS(surromethod::Surrogate) = WLS(Wavelets.WT.Daubechies{16}(), surromethod)

function surrogenerator(x::AbstractVector{T}, method::WLS) where T
    wl = wavelet(method.wt)
    L = length(x)
    x_sorted = sort(x)

    # Wavelet coefficients (step [i] in Keylock)
    W = modwt(x, wl)
    Nscales = ndyadicscales(L)

    # Will contain surrogate realizations of the wavelet coefficients 
    # at each scale (step [ii] in Keylock). 
    sW = zeros(T, size(W))

    # We will also need a matrix to store the mirror images of the 
    # surrogates (last part of step [ii])
    sWmirr = zeros(T, size(W))

    # Surrogate generators for each set of coefficients
    sgs = [surrogenerator(W[:, i], method.surromethod) for i = 1:Nscales]

    # Temporary array for the circular shift error minimizing step 
    circshifted_s = zeros(T, size(W))
    circshifted_smirr = zeros(T, size(W))

    init = (wl = wl, W = W, Nscales = Nscales, L = L, 
            sW = sW, sgs = sgs, sWmirr = sWmirr, 
            circshifted_s = circshifted_s,
            circshifted_smirr = circshifted_smirr,
            x_sorted = x_sorted)
    
    return SurrogateGenerator(method, x, init)
end
 
function (sg::SurrogateGenerator{<:WLS})()
    fds = (:wl, :W, :Nscales, :L, :sW, :sgs, :sWmirr, 
        :circshifted_s, :circshifted_smirr,
        :x_sorted)

    wl, W, Nscales, L, sW, sgs, sWmirr, 
        circshifted_s, circshifted_smirr,
        x_sorted = getfield.(Ref(sg.init), fds)

    # Create surrogate versions of detail coefficients at each dyadic scale [first part of step (ii) in Keylock]   
    for λ in 1:Nscales
        sW[:, λ] = sgs[λ]()
    end
    # Mirror the surrogate coefficients [last part of step (ii) in Keylock]   
    sWmirr .= reverse(sW, dims = 1)

    # Match surrogates and mirror images to original detail coefficients by 
    # circular rotation until some error criterion is minimized. Pick either 
    # the surrogate or its mirror image, depending on which provides the best 
    # fit to the original coefficients.
    optimal_shifts = zeros(Int, Nscales)
    optimal_shifts_mirr = zeros(Int, Nscales)
    minerrors = zeros(Nscales)
    minerrors_mirr = zeros(Nscales)

    for i in 0:L-1
        circshift!(circshifted_s, sW, (i, 0))
        circshift!(circshifted_smirr, sWmirr, (i, 0))

        for λ in 1:Nscales
            origW = W[:, λ]
            
            err = rmsd(origW, circshifted_s[:, λ])
            if err < minerrors[λ]
                minerrors[λ] = err
                optimal_shifts[λ] = i
            end

            err_mirr = rmsd(origW, circshifted_smirr[:, λ])
            if err_mirr < minerrors[λ]
                minerrors_mirr[λ] = err_mirr
                optimal_shifts_mirr[λ] = i
            end
        end
    end
    # Decide which coefficients are retained (either surrogate or mirror surrogate coefficients)
    R = zeros(size(W))
    for λ in 1:Nscales
        if minerrors[λ] >= minerrors_mirr[λ]
            R[:, λ] = circshift(sW[:, λ], optimal_shifts[λ])
        else 
            R[:, λ] = circshift(sWmirr[:, λ], optimal_shifts_mirr[λ])
        end
    end

    s = imodwt(R, wl)
    s[sortperm(s)] = x_sorted

    return s
    
end


function wiaaft(ts; n_maxiter = 100, tol = 1e-5, n_windows = 50)

    # Find the maximum number of levels possible with these data
    L = maxtransformlevels(ts)

    # Create a Daubechies wavelet with 16 vanishing moments and periodic boundary conditions
    wt = wavelet(WT.Daubechies{16}(), WT.Periodic)

    # Do the discrete wavelet transform across levels 1:L
    t = [dwt(ts, wt, i) for i = 1:L]

    # Constrained realization of the coefficients at each level by
    # iAAFT algorithm (treating the coefficients as a time series)
    coeff_surrogates = [iaaft(t[i]) for i in 1:L]

    # Mirror the surrogates
    mirror_surrogates = [reverse(x) for x in coeff_surrogates]

    n = length(ts)
    surrogate_coeffs = Vector{Float64}(undef, n)
    mirror_coeffs = Vector{Float64}(undef, n)
    selected_coeffs = Vector{Float64}(undef, n)
    surrogate = Vector{Float64}(undef, n)
    surrogates = Vector{Tuple{Int, Vector{Float64}, Vector{Float64}, Vector{Float64}}}(undef, 0)
    for dyadic_scale = 1:L
        surrogate_coeffs[:] = iaaft(coeff_surrogates[dyadic_scale])
        mirror_coeffs[:] = reverse(surrogate_coeffs)

        # Circularly rotate to minimize error function
        min_errors = Vector{Float64}(undef, 2)
        [min_errors[i] = Inf for i in 1:2]

        errors = Vector{Float64}(undef, 2)
        shift_minimising_errfunc = Vector{Int}(undef, 2)
        for i in 0:n-1
            errors[1] = rmsd(coeff_surrogates[dyadic_scale],
                            circshift(surrogate_coeffs, i))
            errors[2] = rmsd(coeff_surrogates[dyadic_scale],
                            circshift(mirror_coeffs, i))

            if errors[1] < min_errors[1]
                min_errors[1] = errors[1]
                shift_minimising_errfunc[1] = i
            end

            if errors[2] < min_errors[2]
                min_errors[2] = errors[2]
                shift_minimising_errfunc[2] = i
            end
        end
        if min_errors[1] < min_errors[2]
            selected_coeffs[:] = circshift(surrogate_coeffs, shift_minimising_errfunc[1])
        else
            selected_coeffs[:] = circshift(mirror_coeffs, shift_minimising_errfunc[2])
        end

        # Invert the DWT on original
        inverted =  idwt(coeff_surrogates[dyadic_scale], wt, dyadic_scale)
        inverted_surrogate = idwt(selected_coeffs, wt, dyadic_scale)

        surrogate[sortperm(inverted_surrogate)] = sort(inverted)
        surrogate[sortperm(inverted)] = sort(ts)
        
        push!(surrogates, (dyadic_scale, inverted, inverted_surrogate, surrogate[:]))
    end

    return surrogates
end

export wiaaft
