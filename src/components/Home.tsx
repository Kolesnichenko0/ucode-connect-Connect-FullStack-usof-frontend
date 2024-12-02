import React from 'react'
import {Link} from 'react-router-dom'
import {Button} from '@/components/ui/button'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card'
import RecentPosts from '@/components/posts/RecentPosts.tsx'
import {ArrowRight, Code, MessageSquare, Users} from 'lucide-react'

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background/50 to-background">
            <div className="container mx-auto px-4 py-20 max-w-7xl">
                {/* Hero Section */}
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Welcome to Solve Stack
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                        Your go-to platform for IT discussions, problem-solving, and knowledge sharing.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to="/posts">
                            <Button size="lg" className="gap-2">
                                Explore Posts <ArrowRight className="w-4 h-4"/>
                            </Button>
                        </Link>
                        <Link to="/posts/create">
                            <Button size="lg" variant="outline" className="gap-2">
                                Create a Post <Code className="w-4 h-4"/>
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                    {[
                        {
                            title: 'Expert Community',
                            icon: Users,
                            description: 'Connect with IT professionals and enthusiasts'
                        },
                        {
                            title: 'Diverse Topics',
                            icon: Code,
                            description: 'Explore a wide range of IT and programming subjects'
                        },
                        {
                            title: 'Quick Solutions',
                            icon: MessageSquare,
                            description: 'Get answers to your tech questions fast'
                        },
                    ].map((feature, index) => (
                        <Card key={index} className="bg-card/50 backdrop-blur border shadow-lg">
                            <CardHeader>
                                <feature.icon className="w-10 h-10 text-primary mb-4"/>
                                <CardTitle>{feature.title}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">{feature.description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Recent Posts Section */}
                <Card className="bg-card/50 backdrop-blur border shadow-lg">
                    <CardHeader>
                        <CardTitle className="text-2xl">Recent Posts</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <RecentPosts/>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
