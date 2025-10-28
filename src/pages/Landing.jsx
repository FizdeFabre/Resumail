// src/pages/Landing.jsx
import { Link } from "react-router-dom";
import { Mail, Sparkles, BarChart3, Shield, Brain, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-md sticky top-0 z-50 border-b border-white/20">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-indigo-600" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Resumail</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button variant="outline" className="bg-transparent border-white/30 hover:bg-white/20 text-white">
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="outline" className="bg-white text-indigo-700 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <Badge className="mb-6 bg-white/20 text-white border-white/30">
          <Brain className="w-4 h-4 mr-2" />
          AI-Powered Email Insights
        </Badge>

        <h2 className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight">
          Turn Email Chaos Into
          <span className="block text-white/80">Clarity and Control</span>
        </h2>

        <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10">
          Resumail transforms your inbox into clean, actionable summaries.  
        </p>
          <p className="text-lg md:text-xl text-white/90 max-w-2xl mb-10">
          No clutter, no confusion — just insights that save you hours.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button 
            variant="outline"
              size="lg"
              className="bg-white text-indigo-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Start for Free
            </Button>
          </Link>
          <Link to="/login">
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white text-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Designed for Clarity</h3>
          <p className="text-lg text-gray-600">
            Every email summarized. Every theme surfaced. Every minute saved.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle>Smart Summaries</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-center">
              <p>
                AI-driven summaries that turn your email noise into structured, readable insights.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle>Private by Design</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-center">
              <p>
                Your emails are processed securely. Nothing stored, nothing shared — ever.
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-xl transition-shadow">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <CardTitle>Instant Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-center">
              <p>
                Get digestible reports in seconds — so you can focus on what actually matters.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-indigo-700 text-white text-center">
        <h3 className="text-4xl font-bold mb-4">Start your first analysis today</h3>
        <p className="text-lg text-white/80 mb-8">
          Turn your inbox into a source of clarity and focus in just one click.
        </p>
        <Link to="/signup">
          <Button
          variant="outline"
            size="lg"
            className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
          >
            <ArrowRight className="w-5 h-5 mr-2" />
            Get Started Free
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10 text-center">
        <Mail className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
        <p className="text-sm"> Privacy Policies </p> 
        <p className="text-sm">© {new Date().getFullYear()} Resumail — All rights reserved.</p>
      </footer>
    </div>
  );
}
