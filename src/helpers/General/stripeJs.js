// Stripe.js must be loaded from js.stripe.com (PCI requirement), never bundled.
let loading = null

export function loadStripeJs() {
  if (window.Stripe) return Promise.resolve(window.Stripe)
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script')
      script.src = 'https://js.stripe.com/v3/'
      script.async = true
      script.onload = () => resolve(window.Stripe)
      script.onerror = () => { loading = null; reject(new Error('stripe_js_unavailable')) }
      document.head.appendChild(script)
    })
  }
  return loading
}
