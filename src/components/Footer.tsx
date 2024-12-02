import React from 'react'
import {Link} from 'react-router-dom'
import {Github, Linkedin, Mail, Rocket, Code, Users} from 'lucide-react'
import {Button} from './ui/button'

const Footer: React.FC = () => {
    return (
        <footer className="bg-gradient-to-br from-muted/30 via-muted/10 to-primary/5 border-t">
            <div className="container mx-auto px-4 py-16 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <img
                                src="/logo.png"
                                alt="Logo"
                                className="w-10 h-10 object-contain"
                            />
                            <h3
                                className="text-2xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                                Solve Stack
                            </h3>
                        </div>
                        <p className="text-base text-muted-foreground leading-relaxed">
                            An innovative platform for IT professionals to collaborate, solve challenges, and share
                            knowledge across technology domains.
                        </p>
                        <div className="flex space-x-3">
                            <Button variant="outline" size="icon" asChild>
                                <a href="https://github.com/Kolesnichenko0" target="_blank" rel="noopener noreferrer">
                                    <Github className="w-5 h-5"/>
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                                <a href="https://www.linkedin.com/in/denys-kolesnychenko-79b1a6297/" target="_blank"
                                   rel="noopener noreferrer">
                                    <Linkedin className="w-5 h-5"/>
                                </a>
                            </Button>
                            <Button variant="outline" size="icon" asChild>
                                <a href="mailto:den.koleskos@gmail.com">
                                    <Mail className="w-5 h-5"/>
                                </a>
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <h4 className="text-base font-semibold mb-6 flex items-center gap-2">
                                <Code className="w-5 h-5 text-primary"/> Platform
                            </h4>
                            <ul className="space-y-3">
                                <li><Link to="/posts"
                                          className="text-muted-foreground hover:text-primary transition-colors">Posts</Link>
                                </li>
                                <li><Link to="/categories"
                                          className="text-muted-foreground hover:text-primary transition-colors">Categories</Link>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-base font-semibold mb-6 flex items-center gap-2">
                                <Users className="w-5 h-5 text-primary"/> Community
                            </h4>
                            <ul className="space-y-3">
                                <li><Link to="/users"
                                          className="text-muted-foreground hover:text-primary transition-colors">Users</Link>
                                </li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact Section */}
                </div>

                {/* Copyright */}
                <div className="mt-8 pt-8 border-t border-muted-foreground/20">
                    <p className="text-center text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Solve Stack. Developed by Denys KOLESNYCHENKO, CS-222a, SEMIT,
                        CSIT, NTU "KhPI", Innovation Campus.
                    </p>
                </div>
            </div>
        </footer>
    )
}

export default Footer