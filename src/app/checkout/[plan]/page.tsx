// Checkout sayfası - Ödeme sayfası
// Checkout page - Payment page
'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Check, CreditCard, Lock, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createBrowserClient } from '@supabase/ssr';

// Plan bilgileri
const plans = {
  pro: {
    name: 'Pro',
    price: 9.99,
    yearlyPrice: 95.88,
    features: [
      '50 QR Codes',
      '10,000 Scans/month',
      'Dynamic QR Codes',
      'Analytics Dashboard',
      'Custom Design',
      'Bulk Create',
      'Priority Support',
    ],
  },
  enterprise: {
    name: 'Enterprise',
    price: 29.99,
    yearlyPrice: 287.88,
    features: [
      'Unlimited QR Codes',
      'Unlimited Scans',
      'Dynamic QR Codes',
      'Advanced Analytics',
      'Custom Design',
      'Bulk Create',
      'API Access',
      'Dedicated Support',
      'Custom Branding',
    ],
  },
};

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const planKey = params.plan as keyof typeof plans;
  const plan = plans[planKey];

  const [isYearly, setIsYearly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState<{ email: string } | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUser({ email: data.user.email || '' });
      }
    });
  }, []);

  if (!plan) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Plan not found</h1>
          <Link href="/pricing" className="text-blue-600 hover:underline">
            View available plans
          </Link>
        </div>
      </div>
    );
  }

  const currentPrice = isYearly ? plan.yearlyPrice : plan.price;
  const period = isYearly ? 'year' : 'month';

  const handleCheckout = async () => {
    if (!user) {
      router.push('/auth/login?redirect=/checkout/' + planKey);
      return;
    }
    setIsLoading(true);
    // Burada Stripe checkout session oluşturulacak
    // Şimdilik simüle ediyoruz
    await new Promise((resolve) => setTimeout(resolve, 2000));
    alert('Stripe entegrasyonu yakında eklenecek! Şimdilik demo modunda.');
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Pricing
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Order Summary</h2>
            
            {/* Plan Selection */}
            <div className="border border-blue-200 bg-blue-50 rounded-xl p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold text-gray-900">{plan.name} Plan</span>
                <span className="text-2xl font-bold text-gray-900">
                  ${currentPrice.toFixed(2)}
                  <span className="text-sm font-normal text-gray-500">/{period}</span>
                </span>
              </div>
              
              {/* Billing Toggle */}
              <div className="flex items-center gap-3 mt-4">
                <button
                  onClick={() => setIsYearly(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isYearly ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setIsYearly(true)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isYearly ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  Yearly (Save 20%)
                </button>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3">
              <h3 className="font-medium text-gray-900">Includes:</h3>
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Form */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Details</h2>
            
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 mb-4">Please login to continue with checkout</p>
                <Link
                  href={`/auth/login?redirect=/checkout/${planKey}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                >
                  Login to Continue
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={user.email}
                    disabled
                    className="w-full px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg text-gray-500"
                  />
                </div>

                {/* Stripe Elements placeholder */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Stripe payment form will appear here</p>
                  <p className="text-sm text-gray-400 mt-2">Secure payment powered by Stripe</p>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Processing...' : `Pay $${currentPrice.toFixed(2)}/${period}`}
                </button>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secure checkout powered by Stripe</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

