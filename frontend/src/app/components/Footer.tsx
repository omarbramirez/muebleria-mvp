import Link from 'next/link';

export default function Footer() {
  const sitemap = {
    'Main Pages': [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
      { name: 'Contact', href: '/contact' },
    ],
    'Products': [
      { name: 'All Products', href: '/products' },
      { name: 'Categories', href: '/products/categories' },
      { name: 'New Arrivals', href: '/products/new' },
    ],
    'Resources': [
      { name: 'Blog', href: '/blog' },
      { name: 'FAQ', href: '/faq' },
      { name: 'Support', href: '/support' },
    ],
    'Legal': [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {Object.entries(sitemap).map(([section, links]) => (
            <div key={section}>
              <h3 className="text-lg font-semibold mb-4">{section}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-gray-300 hover:text-white transition-colors">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-gray-400"> &copy; {new Date().getFullYear()} Omar B Ramírez. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}