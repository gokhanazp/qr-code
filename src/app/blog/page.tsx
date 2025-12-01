// Blog sayfası - Blog yazıları listesi
// Blog page - Blog posts list
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

// Örnek blog yazıları (gerçek uygulamada veritabanından gelir)
const blogPosts = [
  {
    id: 1,
    title: 'How to Create Effective QR Codes for Your Business',
    excerpt: 'Learn the best practices for creating QR codes that drive engagement and conversions.',
    date: '2024-11-28',
    readTime: '5 min read',
    category: 'Tips & Tricks',
    image: '/blog/qr-business.jpg',
  },
  {
    id: 2,
    title: 'QR Codes in Restaurant Menus: A Complete Guide',
    excerpt: 'Discover how restaurants are using QR codes to enhance customer experience.',
    date: '2024-11-25',
    readTime: '4 min read',
    category: 'Use Cases',
    image: '/blog/qr-restaurant.jpg',
  },
  {
    id: 3,
    title: 'The Future of QR Codes: Trends for 2025',
    excerpt: 'Explore upcoming trends and innovations in QR code technology.',
    date: '2024-11-20',
    readTime: '6 min read',
    category: 'Industry News',
    image: '/blog/qr-future.jpg',
  },
  {
    id: 4,
    title: 'Dynamic vs Static QR Codes: Which Should You Use?',
    excerpt: 'Understanding the differences and when to use each type of QR code.',
    date: '2024-11-15',
    readTime: '4 min read',
    category: 'Education',
    image: '/blog/qr-types.jpg',
  },
  {
    id: 5,
    title: 'QR Code Design Tips: Making Your Codes Stand Out',
    excerpt: 'Creative ways to customize your QR codes while maintaining scannability.',
    date: '2024-11-10',
    readTime: '5 min read',
    category: 'Design',
    image: '/blog/qr-design.jpg',
  },
  {
    id: 6,
    title: 'Tracking QR Code Performance: Analytics Guide',
    excerpt: 'How to measure and optimize your QR code campaigns with analytics.',
    date: '2024-11-05',
    readTime: '7 min read',
    category: 'Analytics',
    image: '/blog/qr-analytics.jpg',
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">QRCodeGen Blog</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Tips, tutorials, and insights about QR codes and digital marketing.
          </p>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-shadow overflow-hidden group"
              >
                {/* Placeholder image */}
                <div className="h-48 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-6xl">📱</span>
                </div>
                <div className="p-6">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-600 text-sm font-medium rounded-full mb-3">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h2>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="text-blue-600 font-medium flex items-center gap-1 hover:gap-2 transition-all"
                    >
                      Read <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter CTA */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Updated</h2>
          <p className="text-gray-600 mb-6">
            Subscribe to our newsletter for the latest QR code tips and updates.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}

