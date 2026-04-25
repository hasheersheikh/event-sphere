import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { motion } from "framer-motion";
import PublicPageHeader from "@/components/layout/PublicPageHeader";

const PrivacyPolicy = () => {
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
            pillText="Legal Protocol"
            title={
              <>
                Privacy <span className="text-primary italic">Policy.</span>
              </>
            }
            subtitle="Last Updated: January 18, 2026. Your privacy is paramount to the Collective."
            themeColor="primary"
            size="md"
            className="mb-12"
          />

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
              <p>
                We collect information you provide directly to us when you create an account, purchase tickets, or create an event. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Name and contact information (email, phone number)</li>
                <li>Profile information</li>
                <li>Payment details (processed securely by our partners)</li>
                <li>Event details (for organizers)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Provide, maintain, and improve our services</li>
                <li>Process transactions and send related information</li>
                <li>Communicate with you about events and updates</li>
                <li>Monitor and analyze trends and usage</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">3. Information Sharing</h2>
              <p>
                We do not share your personal information with third parties except:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>With event organizers (limited to details needed for the event)</li>
                <li>To comply with legal obligations</li>
                <li>With service providers who perform work on our behalf</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
              <p>
                We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">5. Your Choices</h2>
              <p>
                You may update your account information at any time by logging into your account settings. You can also request deletion of your account and data by contacting support.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">6. Cookies</h2>
              <p>
                We use cookies to enhance your experience and collect usage data. You can control cookie settings through your browser.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4">7. Updates to this Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. If we make changes, we will notify you by revising the date at the top of the policy.
              </p>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default PrivacyPolicy;
