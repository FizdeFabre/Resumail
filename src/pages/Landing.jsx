  // src/pages/Landing.jsx
  import { Link } from "react-router-dom";
  import { Mail, Brain, ArrowRight, Shield, Sparkles, BarChart3 } from "lucide-react";
  import { Button } from "@/components/ui/Button";
  import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/Card";
  import { Badge } from "@/components/ui/Badge";
  import { motion } from "framer-motion";

  import Logo from "@/public/logo.png"

  export default function Landing() {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 text-white flex flex-col">
        {/* === Navbar === */}
        <nav className="bg-white/10 backdrop-blur-md sticky top-0 z-50 border-b border-white/20">
          <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
     <img src={Logo} alt="Logo" width={32} height={32} className="rounded-lg" />
              </div>
          //  <h1 className="text-xl font-bold tracking-tight">Resumail (A virer ssi image marche bien ). </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login">
              <Button
                variant="outline"
                className="bg-transparent border-white/30 hover:bg-white/20 text-white"
              >
                Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button className="bg-white text-indigo-700 hover:bg-gray-100">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* === Hero Section === */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        <Badge className="mb-6 bg-white/20 text-white border-white/30 flex items-center gap-2">
          <Brain className="w-4 h-4" />
          AI-Powered Email Insights
        </Badge>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-6xl font-extrabold mb-6 leading-tight"
        >
          Turn inbox noise <br />
          <span className="text-white/80">into clarity.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mb-10"
        >
          Resumail uses AI to summarize your Gmail inbox and extract key themes,
          insights, and sentiment — so you can understand what really matters
          in your emails, not just read them.
        </motion.p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Try it Free
            </Button>
          </Link>
        </div>
      </section>

      {/* === How it Works === */}
      <section id="how-it-works" className="bg-white text-gray-900 py-20 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">How Resumail Works</h3>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Three simple steps to get powerful insights from your emails.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              icon: <Mail className="w-8 h-8 text-indigo-600" />,
              step: "1",
              title: "Connect Gmail",
              desc: "Securely link your Gmail account. Your data stays private and is never stored permanently.",
            },
            {
              icon: <Brain className="w-8 h-8 text-purple-600" />,
              step: "2",
              title: "AI Processing",
              desc: "Resumail scans your latest emails and extracts key topics, tone, and recurring insights automatically.",
            },
            {
              icon: <BarChart3 className="w-8 h-8 text-pink-600" />,
              step: "3",
              title: "Get Your Summary",
              desc: "Instantly receive a clear, actionable overview — perfect for understanding customer feedback or project context.",
            },
          ].map((item, idx) => (
            <Card
              key={idx}
              className="border-0 shadow-md hover:shadow-xl transition-shadow"
            >
              <CardHeader className="text-center pb-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {item.icon}
                </div>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-600 text-center">
                <p>{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* === Feature Highlights === */}
      <section className="py-20 px-6 bg-gradient-to-br from-white via-gray-50 to-indigo-50 text-gray-900">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h3 className="text-4xl font-bold mb-4">Why Teams Love Resumail</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            It’s more than summaries — it’s clarity, privacy, and insight in one
            smooth experience.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle>Smart Summaries</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-center">
              <p>
                AI-driven summaries that turn your email noise into structured,
                readable insights.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-purple-600" />
              </div>
              <CardTitle>Private by Design</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-center">
              <p>
                Your emails are processed securely. Nothing stored, nothing
                shared — ever.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition">
            <CardHeader className="text-center pb-6">
              <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-pink-600" />
              </div>
              <CardTitle>Instant Insights</CardTitle>
            </CardHeader>
            <CardContent className="text-gray-600 text-center">
              <p>
                Get digestible reports in seconds — so you can focus on what
                actually matters.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* === CTA Section === */}
      <section className="py-24 px-6 bg-indigo-700 text-white text-center relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h3 className="text-4xl font-bold mb-6">
            Start making sense of your inbox today.
          </h3>
          <p className="text-white/80 mb-10 max-w-2xl mx-auto text-lg">
            No more endless scrolling. Let Resumail show you what matters most
            — in seconds.
          </p>
          <Link to="/signup">
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-gray-100 text-lg px-8 py-4 font-semibold"
            >
              <ArrowRight className="w-5 h-5 mr-2" />
              Get Started for Free
            </Button>
          </Link>
        </motion.div>
      </section>

      {/* === Footer === */}
      <footer className="bg-gray-950 text-gray-400 py-10 text-center border-t border-white/10">
        <Mail className="w-6 h-6 mx-auto mb-2 text-indigo-400" />
        <p className="text-sm">
          Built by Pink Filly © {new Date().getFullYear()} — contact:
          pinkfillysaas@gmail.com
        </p>
        <div className="text-xs mt-2 text-gray-500">
          <Link to="/terms" className="hover:text-gray-300">
            Terms
          </Link>{" "}
          ·{" "}
          <Link to="/privacy" className="hover:text-gray-300">
            Privacy
          </Link>
        </div>
      </footer>
    </div>
  );
}
