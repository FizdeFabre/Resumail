import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { Mail, ArrowRight } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* === Navigation === */}
      <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Resumail</h1>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-gray-600 hover:text-gray-900">
              Login
            </Link>
            <Link to="/signup">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* === Hero Section === */}
      <section className="flex-1 flex items-center justify-center px-6 py-20">
        <div className="max-w-3xl text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
            Turn inbox noise <br />
            <span className="text-indigo-600">into clarity.</span>
          </h2>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            Resumail uses AI to summarize your Gmail inbox and extract key themes, 
            insights, and sentiment — so you can understand what really matters 
            in your emails, not just read them.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/signup">
              <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4">
                Try it free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 text-lg border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition"
            >
              See how it works
            </a>
          </div>
        </div>
      </section>

      {/* === How it works === */}
      <section id="how-it-works" className="py-24 bg-gray-50 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">How Resumail works</h3>
          <p className="text-gray-600 text-lg mb-16 max-w-2xl mx-auto">
            Three simple steps to get powerful insights from your emails.
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600 font-bold">
                1
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900">Connect Gmail</h4>
              <p className="text-gray-600 text-sm">
                Securely link your Gmail account. Your data stays private and is never stored permanently.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600 font-bold">
                2
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900">AI Processing</h4>
              <p className="text-gray-600 text-sm">
                Resumail scans your latest emails and extracts key topics, tone, and recurring insights automatically.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-4 text-indigo-600 font-bold">
                3
              </div>
              <h4 className="font-semibold text-lg mb-2 text-gray-900">Get Your Summary</h4>
              <p className="text-gray-600 text-sm">
                Instantly receive a clear, actionable overview — perfect for understanding customer feedback or project context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* === CTA Section === */}
      <section className="py-20 text-center bg-white">
        <h3 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Start making sense of your inbox today.
        </h3>
        <p className="text-gray-600 mb-10 max-w-2xl mx-auto">
          No more endless scrolling. Let Resumail show you what matters most — in seconds.
        </p>
        <Link to="/signup">
          <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-4">
            Get Started for Free
          </Button>
        </Link>
      </section>

      {/* === Footer === */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h4 className="text-xl font-bold mb-2">Resumail</h4>
          <p className="text-gray-400 text-sm mb-4">
            Built by Pink Filly © {new Date().getFullYear()} — contact: pinkfillysaas@gmail.com
          </p>
          <div className="text-gray-500 text-xs">
            <a href="/terms" className="hover:text-gray-300">Terms</a> ·{" "}
            <a href="/privacy" className="hover:text-gray-300">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
