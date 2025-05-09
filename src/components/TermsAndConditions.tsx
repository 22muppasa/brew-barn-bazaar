
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface TermsAndConditionsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsAndConditions: React.FC<TermsAndConditionsProps> = ({
  open,
  onOpenChange,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl mb-4">Terms and Conditions</DialogTitle>
          <DialogDescription className="text-foreground">
            <div className="space-y-4 text-sm">
              <h2 className="font-semibold text-lg">1. Introduction</h2>
              <p>
                Welcome to Brew Barn. These Terms and Conditions govern your use of our website, mobile application, and services. By accessing or using our services, you agree to be bound by these Terms.
              </p>

              <h2 className="font-semibold text-lg">2. Definitions</h2>
              <p>
                "Company", "We", "Us", or "Our" refers to Brew Barn.
                "Service" refers to the Company's website, mobile application, and services.
                "You" refers to the individual accessing or using the Service, or the company, or other legal entity on behalf of which such individual is accessing or using the Service.
                "Account" means a unique account created for You to access our Service.
              </p>

              <h2 className="font-semibold text-lg">3. Account Registration</h2>
              <p>
                To use certain features of the Service, you must register for an account. You must provide accurate, current, and complete information during the registration process and keep your account information up-to-date.
              </p>

              <h2 className="font-semibold text-lg">4. User Responsibilities</h2>
              <p>
                You are responsible for safeguarding your account and for any activities or actions under your account. You agree not to disclose your password to any third party.
              </p>

              <h2 className="font-semibold text-lg">5. Content</h2>
              <p>
                Our Service allows you to post, link, store, share and otherwise make available certain information, text, graphics, videos, or other material. You are responsible for the content that you post on or through the Service.
              </p>

              <h2 className="font-semibold text-lg">6. Purchases</h2>
              <p>
                If you wish to purchase any product or service made available through the Service, you may be asked to supply certain information relevant to your purchase including your credit card number, the expiration date of your credit card, your billing address, and your shipping information.
              </p>

              <h2 className="font-semibold text-lg">7. Rewards Program</h2>
              <p>
                Participation in our rewards program is subject to these Terms and any additional terms specific to the rewards program. We reserve the right to modify, suspend, or terminate the rewards program at any time.
              </p>

              <h2 className="font-semibold text-lg">8. Prohibited Uses</h2>
              <p>
                You may use our Service only for lawful purposes and in accordance with these Terms. You agree not to use the Service for any unlawful purpose or in any way that could damage, disable, overburden, or impair the Service.
              </p>

              <h2 className="font-semibold text-lg">9. Intellectual Property</h2>
              <p>
                The Service and its original content, features, and functionality are and will remain the exclusive property of Brew Barn and its licensors. The Service is protected by copyright, trademark, and other laws.
              </p>

              <h2 className="font-semibold text-lg">10. Privacy Policy</h2>
              <p>
                Our Privacy Policy describes our policies and procedures on the collection, use, and disclosure of your personal information. By using our Service, you agree to the collection and use of information in accordance with our Privacy Policy.
              </p>

              <h2 className="font-semibold text-lg">11. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. We will notify you of any changes by posting the new Terms on this page and updating the "Last Updated" date.
              </p>

              <h2 className="font-semibold text-lg">12. Termination</h2>
              <p>
                We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including without limitation if you breach these Terms.
              </p>

              <h2 className="font-semibold text-lg">13. Limitation of Liability</h2>
              <p>
                In no event shall Brew Barn, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of or inability to use the Service.
              </p>

              <h2 className="font-semibold text-lg">14. Governing Law</h2>
              <p>
                These Terms shall be governed and construed in accordance with the laws of the jurisdiction in which the Company is established, without regard to its conflict of law provisions.
              </p>

              <h2 className="font-semibold text-lg">15. Contact Us</h2>
              <p>
                If you have any questions about these Terms, please contact us at support@brewbarn.com.
              </p>

              <p className="text-muted-foreground mt-6">
                Last Updated: May 9, 2025
              </p>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditions;
