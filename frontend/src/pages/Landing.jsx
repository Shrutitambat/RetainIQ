import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { 
  Activity, ArrowRight, Brain, BarChart3, Users, 
  Shield, TrendingDown, Sparkles, Check 
} from "lucide-react"

export default function Landing() {
  
  // Animation variants for staggered list
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  }

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 relative overflow-hidden">
      
      {/* Background Blurred Orbs */}
      <div className="absolute top-[10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-[#6366f1] opacity-[0.12] filter blur-[100px] pointer-events-none" />
      <div className="absolute top-[5%] right-[-10%] w-[350px] h-[350px] rounded-full bg-[#8b5cf6] opacity-[0.12] filter blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[30%] w-[400px] h-[400px] rounded-full bg-[#06b6d4] opacity-[0.1] filter blur-[120px] pointer-events-none" />

      {/* Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#030712]/80 backdrop-blur-md border-b border-[rgba(99,102,241,0.15)] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-[#6366f1] rounded-xl flex items-center justify-center shadow-lg shadow-[#6366f1]/20">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight gradient-text">RetainIQ</span>
          </Link>
          
          {/* CTAs */}
          <div className="flex items-center gap-4">
            <Link 
              to="/login" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2 hover:bg-[#1e2a45]/20 rounded-xl"
            >
              Sign In
            </Link>
            <Link 
              to="/register" 
              className="btn-primary text-xs font-semibold px-4 py-2"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="space-y-6 max-w-4xl"
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#6366f1]/10 border border-[#6366f1]/20 text-xs font-semibold text-[#6366f1] shadow-lg shadow-[#6366f1]/5">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by XGBoost + Gemini AI</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-100 leading-[1.1]">
            Stop Losing Customers.
            <br />
            <span className="gradient-text">Start Retaining Them.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            RetainIQ analyzes customer usage patterns to predict churn risks with 92% accuracy, generating instant, actionable AI playbooks to save at-risk cohorts.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              to="/register" 
              className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-semibold py-3 px-6"
            >
              Start Free Analysis
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link 
              to="/login" 
              className="w-full sm:w-auto py-3 px-6 border border-slate-800 bg-[#0f1629] text-sm font-semibold rounded-xl text-slate-300 hover:border-[#6366f1]/50 hover:bg-[#151e36] transition-all flex items-center justify-center"
            >
              Sign In
            </Link>
          </div>
        </motion.div>

        {/* Mock Dashboard Preview Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="w-full max-w-4xl mt-16 glass-card p-6 shadow-2xl relative"
        >
          {/* Traffic light dots */}
          <div className="flex gap-1.5 absolute top-4 left-6">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>

          <div className="pt-6 space-y-6 text-left">
            {/* Inner top stats grid */}
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-[#030712] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Cohort Churn Risk</span>
                <p className="text-xl font-bold text-red-500 mt-1">High Risk</p>
              </div>
              <div className="bg-[#030712] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Avg Churn Probability</span>
                <p className="text-xl font-bold text-slate-200 mt-1">79.4%</p>
              </div>
              <div className="bg-[#030712] border border-[rgba(99,102,241,0.15)] rounded-xl p-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Retention Health</span>
                <p className="text-xl font-bold text-[#06b6d4] mt-1">Optimizing</p>
              </div>
            </div>

            {/* Progress Bar Animation */}
            <div className="bg-[#030712] border border-[rgba(99,102,241,0.15)] rounded-xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
                <span>Analyzing Uploaded Churn Batch...</span>
                <span className="text-[#6366f1]">79.4% Probability</span>
              </div>
              <div className="w-full bg-[#0f1629] h-2.5 rounded-full overflow-hidden border border-slate-800">
                <motion.div
                  initial={{ width: "0%" }}
                  whileInView={{ width: "79.4%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] rounded-full"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Stats Bar */}
      <section className="border-t border-b border-[rgba(99,102,241,0.15)] bg-[#0f1629]/20 py-12 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold gradient-text">92%</span>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Model Accuracy</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold gradient-text">3x</span>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Faster Analysis</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold gradient-text">10K+</span>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Customers Analyzed</p>
          </div>
          <div className="space-y-1">
            <span className="text-3xl sm:text-4xl font-extrabold gradient-text">↓45%</span>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Churn Reduction</p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 max-w-7xl mx-auto space-y-12">
        <div className="text-center space-y-3">
          <h2 className="text-2xl sm:text-4xl font-bold text-slate-100">Everything you need to retain customers</h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">All-in-one predictive churn engine running real-time ML batch classifications coupled with automated AI reasoning.</p>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start gap-4 hover:border-[#6366f1]/40 transition-all duration-300 group">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1] group-hover:bg-[#6366f1]/20 transition-all border border-[#6366f1]/10">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-200">ML Predictions</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Predict customer risk flags instantly using our trained XGBoost classifier optimized for customer retention metrics.</p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start gap-4 hover:border-[#6366f1]/40 transition-all duration-300 group">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1] group-hover:bg-[#6366f1]/20 transition-all border border-[#6366f1]/10">
              <BarChart3 className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-200">History & Charts</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Track trends, cohort risk scales, and average churn metrics over time using interactive dashboard visualizations.</p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start gap-4 hover:border-[#6366f1]/40 transition-all duration-300 group">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1] group-hover:bg-[#6366f1]/20 transition-all border border-[#6366f1]/10">
              <Users className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-200">Customer Segmentation</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Auto-segment customer lists based on contract terms, monthly fees, and tenure values to target the right cohorts.</p>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start gap-4 hover:border-[#6366f1]/40 transition-all duration-300 group">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1] group-hover:bg-[#6366f1]/20 transition-all border border-[#6366f1]/10">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-200">Secure Architecture</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Strict authentication, secure password hashes, and OAuth2 authorization bearer guards protect your data endpoints.</p>
          </motion.div>

          {/* Card 5 */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start gap-4 hover:border-[#6366f1]/40 transition-all duration-300 group">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1] group-hover:bg-[#6366f1]/20 transition-all border border-[#6366f1]/10">
              <TrendingDown className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-200">Risk Explanations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">View a detailed feature breakdown describing exactly why a particular customer has been identified as a churn risk.</p>
          </motion.div>

          {/* Card 6 */}
          <motion.div variants={itemVariants} className="glass-card p-6 flex flex-col items-start gap-4 hover:border-[#6366f1]/40 transition-all duration-300 group">
            <div className="p-3 bg-[#6366f1]/10 rounded-xl text-[#6366f1] group-hover:bg-[#6366f1]/20 transition-all border border-[#6366f1]/10">
              <Sparkles className="h-5 w-5" />
            </div>
            <h3 className="font-bold text-slate-200">AI Recommendations</h3>
            <p className="text-xs text-slate-500 leading-relaxed">Obtain customized, actionable steps powered by Gemini AI templates to recover high and medium risk customer cohorts.</p>
          </motion.div>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6 max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="glass-card p-12 text-center flex flex-col items-center gap-6 shadow-2xl relative overflow-hidden"
        >
          {/* Subtle inside background orb */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-[#6366f1] opacity-[0.05] filter blur-[70px] pointer-events-none" />
          
          <h2 className="text-3xl font-extrabold text-slate-100">Ready to reduce churn?</h2>
          <p className="text-slate-400 text-sm max-w-lg">
            Create your account today and gain immediate access to ML predictions, feature risk insights, and automated AI playbooks.
          </p>
          <Link 
            to="/register" 
            className="btn-primary flex items-center justify-center gap-2 text-sm font-semibold py-3 px-8 mt-2"
          >
            Get Started Free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[rgba(99,102,241,0.15)] py-8 text-center text-xs text-slate-500 relative z-10">
        <p>© 2024 RetainIQ · Built with XGBoost + Gemini AI</p>
      </footer>

    </div>
  )
}