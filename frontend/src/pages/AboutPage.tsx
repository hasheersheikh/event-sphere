import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Shield, Globe, Rocket } from "lucide-react";

const AboutPage = () => {
  const stats = [
    { label: "Events Hosted", value: "10k+", icon: Globe },
    { label: "Happy Attendees", value: "500k+", icon: Users },
    { label: "Security First", value: "100%", icon: Shield },
    { label: "Community", value: "Active", icon: Rocket },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-primary/5 border-b">
          <div className="container text-center max-w-4xl mx-auto px-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-bold mb-6"
            >
              Reimagining{" "}
              <span className="gradient-text">Event Management</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-xl text-muted-foreground leading-relaxed"
            >
              City Pulse is a premium platform designed to connect people
              through unforgettable experiences. From local meetups to global
              conferences, we provide the tools to make every event a success.
            </motion.p>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-20 container max-w-4xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-muted-foreground text-lg mb-4">
                We believe that human connection is the foundation of progress.
                Our mission is to empower individuals and organizations to
                create spaces where these connections can flourish.
              </p>
              <p className="text-muted-foreground text-lg">
                By combining cutting-edge technology with intuitive design,
                we've built a platform that removes the friction from event
                planning and discovery.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  className="p-6 bg-card rounded-2xl border flex flex-col items-center text-center"
                >
                  <stat.icon className="h-8 w-8 text-primary mb-3" />
                  <span className="text-2xl font-bold mb-1">{stat.value}</span>
                  <span className="text-xs text-muted-foreground uppercase tracking-wider">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-20 bg-muted/30">
          <div className="container max-w-6xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-12">
              Built on Strong Foundations
            </h2>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              {[
                {
                  title: "Security & Trust",
                  desc: "Your data and payments are protected by industry-leading security standards. We prioritize your privacy above all else.",
                },
                {
                  title: "Manager Empowerment",
                  desc: "We provide event organizers with powerful analytics, intuitive tools, and complete control over their events.",
                },
                {
                  title: "Seamless Discovery",
                  desc: "Finding your next great experience should be easy. Our advanced search and filtering help you discover events tailored to your interests.",
                },
              ].map((value, i) => (
                <div
                  key={i}
                  className="p-8 bg-card rounded-2xl border border-primary/5"
                >
                  <h3 className="text-xl font-bold mb-4">{value.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {value.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Join Us Section */}
        <section className="py-20 container text-center">
          <div className="bg-primary/5 rounded-3xl p-12 md:p-20 border border-primary/10 max-w-5xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Ready to Experience the Difference?
            </h2>
            <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto">
              Join thousands of organizers and attendees who are already using
              City Pulse to create and discover amazing events.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/auth">
                <Button
                  size="lg"
                  className="px-8 h-12 text-lg rounded-xl shadow-button"
                >
                  Get Started for Free
                </Button>
              </Link>
              <Link to="/events">
                <Button
                  variant="outline"
                  size="lg"
                  className="px-8 h-12 text-lg rounded-xl"
                >
                  Browse Events
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default AboutPage;
