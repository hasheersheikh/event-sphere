import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container py-12 md:py-20 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
          <p className="text-muted-foreground mb-8 text-lg">
            Last Updated: January 18, 2026
          </p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">
                1. Acceptance of Terms
              </h2>
              <p>
                By accessing or using City Pulse, you agree to be bound by these
                Terms of Service. If you do not agree to all of these terms, you
                should not use our platform.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                2. Description of Service
              </h2>
              <p>
                City Pulse is a platform that allows users to discover, create,
                and manage events. We provide tools for organizers (Event
                Managers) to sell tickets and for attendees to book and manage
                their event experiences.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                3. User Responsibilities
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  You must be at least 18 years old to create and manage events.
                </li>
                <li>
                  You are responsible for maintaining the confidentiality of
                  your account credentials.
                </li>
                <li>
                  You agree not to use the service for any illegal or
                  unauthorized purpose.
                </li>
                <li>
                  All information provided during registration and event
                  creation must be accurate and complete.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                4. Event Manager Guidelines
              </h2>
              <p>
                As an Event Manager, you are responsible for the events you
                create. You must ensure that all event details are accurate and
                that you have the right to host the event. City Pulse reserves
                the right to remove any event that violates our policies or
                local laws.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                5. Ticketing and Refunds
              </h2>
              <p>
                All ticket sales are subject to the specific refund policy
                established by the event organizer. City Pulse is not
                responsible for issuing refunds unless explicitly stated
                otherwise for a specific service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                6. Limitation of Liability
              </h2>
              <p>
                City Pulse shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages resulting from your
                use of or inability to use the service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">
                7. Contact Information
              </h2>
              <p>
                If you have any questions about these Terms, please contact us
                at support@citypulse.com.
              </p>
            </section>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
