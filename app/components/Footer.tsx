// client/app/components/Footer.tsx

const Footer = () => {
    const socialLinks = [
        { 
            name: "Facebook", 
            href: "https://www.facebook.com/tedxtist", 
            icon: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /> 
        },
        { 
            name: "Twitter", 
            href: "https://twitter.com/tedxtist", 
            icon: <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /> 
        },
        { 
            name: "Instagram", 
            href: "https://www.instagram.com/tedxtist/", 
            icon: (
                <>
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </>
            )
        },
        { 
            name: "LinkedIn", 
            href: "https://www.linkedin.com/company/tedxtist/", 
            icon: (
                <>
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                </>
            )
        },
    ];

    return (
        <footer className="bg-black/90 text-gray-400 py-8 border-t border-white/10 mt-20">
            <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
                <p className="text-sm font-medium">
                    &copy; {new Date().getFullYear()} <span className="tedx-red-glow text-red-600">TEDx</span>TIST. All rights reserved.
                </p>
                
                <div className="flex space-x-6 mt-6 md:mt-0">
                    {socialLinks.map((social) => (
                        <a 
                            key={social.name}
                            href={social.href} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            aria-label={`Follow TEDxTIST on ${social.name}`}
                            className="tedx-red-glow-hover hover:text-red-600 transition-all duration-300 transform hover:scale-110"
                        >
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="20" 
                                height="20" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                {social.icon}
                            </svg>
                        </a>
                    ))}
                </div>
            </div>
        </footer>
    );
}

export default Footer;