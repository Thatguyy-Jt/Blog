import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Send, Twitter, Linkedin, Github } from 'lucide-react'; 

export default function Footer() {
    // Helper function to get the current year for the copyright notice
    const currentYear = new Date().getFullYear();

    return (
        // Footer Container: Dark, full-width
        <footer className="bg-gray-900 border-t border-gray-800 mt-12"> 
            
            {/* 1. REDUCED PADDING: Changed py-12 to py-8 (tighter vertical spacing) */}
            <div className="container mx-auto px-4 md:px-8 py-8">
                
                {/* Top Section: Logo/Name and Newsletter/Call-to-Action */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-800 pb-6 mb-6"> {/* Reduced pb/mb for less space */}
                    
                    {/* Brand/Logo */}
                    <div className="mb-4 md:mb-0"> {/* Reduced mb */}
                        <h3 className="text-2xl font-extrabold text-accent tracking-tight"> {/* Slightly reduced font size */}
                            <span className="text-white">Modern</span>Blog
                        </h3>
                        <p className="mt-1 text-gray-500 max-w-sm text-sm"> {/* Reduced mt and text size */}
                            A curated collection of stories, insights, and ideas for the modern reader.
                        </p>
                    </div>

                    {/* Newsletter/CTA Form */}
                    <div className="w-full md:w-auto md:max-w-sm">
                        <p className="text-base font-semibold text-white mb-2"> {/* Reduced font size and mb */}
                            Stay Updated
                        </p>
                        <form className="flex space-x-2">
                            <input
                                type="email"
                                placeholder="Enter your email"
                                aria-label="Subscribe to newsletter"
                                className="flex-grow rounded-lg bg-gray-800 text-white border border-gray-700 px-3 py-1.5 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm" // Reduced input size
                            />
                            <button
                                type="submit"
                                aria-label="Subscribe"
                                className="bg-indigo-600 text-white rounded-lg p-2 hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-500/30" // Reduced button padding
                            >
                                <Send size={18} /> {/* Slightly reduced icon size */}
                            </button>
                        </form>
                    </div>
                </div>

                {/* 2. CONSOLIDATED LINK COLUMNS: Merged Site Map and Legal into a 3-column layout */}
                <div className="grid grid-cols-2 gap-6 md:grid-cols-4 text-sm"> 
                    
                    {/* Column 1: Primary Site Links (Site Map) */}
                    <div className="col-span-1">
                        <h4 className="font-semibold text-gray-400 mb-3 uppercase tracking-wider">Explore</h4>
                        <ul className="space-y-2"> {/* Tighter spacing */}
                            <li><Link to="/" className="text-gray-500 hover:text-indigo-400 transition-colors">Home</Link></li>
                          
                        </ul>
                    </div>

                    {/* Column 2: Legal and Resources (Combined) */}
                    <div className="col-span-1">
                        <h4 className="font-semibold text-gray-400 mb-3 uppercase tracking-wider">Info</h4>
                        <ul className="space-y-2">
                            <li><Link to="/privacy" className="text-gray-500 hover:text-indigo-400 transition-colors">Privacy Policy</Link></li>
                            <li><Link to="/terms" className="text-gray-500 hover:text-indigo-400 transition-colors">Terms of Service</Link></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors">Support</a></li>
                            <li><a href="#" className="text-gray-500 hover:text-indigo-400 transition-colors">Careers</a></li>
                        </ul>
                    </div>
                    
                    {/* Column 3: Social Links (Spans 2 columns on mobile/small screen) */}
                    <div className="col-span-2 md:col-span-2">
                        <h4 className="font-semibold text-gray-400 mb-3 uppercase tracking-wider">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="https://twitter.com" aria-label="Twitter" className="text-gray-500 hover:text-indigo-400 transition-colors">
                                <Twitter size={20} /> {/* Reduced icon size */}
                            </a>
                            <a href="https://linkedin.com" aria-label="LinkedIn" className="text-gray-500 hover:text-indigo-400 transition-colors">
                                <Linkedin size={20} />
                            </a>
                            <a href="https://github.com" aria-label="GitHub" className="text-gray-500 hover:text-indigo-400 transition-colors">
                                <Github size={20} />
                            </a>
                            <a href="mailto:info@blog.com" aria-label="Email" className="text-gray-500 hover:text-indigo-400 transition-colors">
                                <Mail size={20} />
                            </a>
                        </div>
                    </div>

                </div>

                {/* Bottom Section: Copyright */}
                <div className="pt-6 mt-6 border-t border-gray-800 text-center"> {/* Reduced pt/mt */}
                    <p className="text-gray-500 text-xs"> {/* Reduced text size */}
                        &copy; {currentYear} ModernBlog. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}