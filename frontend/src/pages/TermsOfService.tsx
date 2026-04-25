import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

const TermsOfService = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 mesh-bg opacity-30 z-0" />
      <div className="fixed top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2 translate-x-1/2" />
      <div className="fixed bottom-0 left-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none translate-y-1/2 -translate-x-1/2" />

      <Navbar />
      <main className="flex-1 relative z-10">
        <section className="container pt-16 pb-8 md:pt-20 md:pb-12 max-w-4xl">
          <PublicPageHeader
            pillText="The Agreement"
            title={
              <>
                Terms of <span className="text-primary italic">Service.</span>
              </>
            }
            subtitle="Last Updated: January 18, 2026. Please read the protocol of use for the Collective."
            themeColor="primary"
            size="md"
            className="mb-12"
          />

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
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default TermsOfService;
