
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useGuestCart } from "@/hooks/useLocalStorage";
import { useNavigate } from "react-router-dom";

interface GuestCheckoutFormProps {
  total: number;
}

const GuestCheckoutForm = ({ total }: GuestCheckoutFormProps) => {
  const navigate = useNavigate();
  const { clearCart } = useGuestCart();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Validate form
    const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "state", "zipCode"];
    const missingFields = requiredFields.filter((field) => !formData[field as keyof typeof formData]);

    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(", ")}`);
      setIsSubmitting(false);
      return;
    }

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Process order (in a real app, this would send the data to a server)
    clearCart();
    toast.success("Your order has been placed successfully!");
    navigate("/");
    setIsSubmitting(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Guest Checkout</h2>
        <p className="text-muted-foreground">
          Please fill in your details to complete your order.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="checkout-form">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="form-group">
            <Label htmlFor="firstName" className="form-label">First Name*</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="lastName" className="form-label">Last Name*</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="form-group">
            <Label htmlFor="email" className="form-label">Email*</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="phone" className="form-label">Phone*</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <Label htmlFor="address" className="form-label">Address*</Label>
          <Input
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="form-input"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="form-group">
            <Label htmlFor="city" className="form-label">City*</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="state" className="form-label">State*</Label>
            <Input
              id="state"
              name="state"
              value={formData.state}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>

          <div className="form-group">
            <Label htmlFor="zipCode" className="form-label">Zip Code*</Label>
            <Input
              id="zipCode"
              name="zipCode"
              value={formData.zipCode}
              onChange={handleChange}
              className="form-input"
              required
            />
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-md mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Order Total:</span>
            <span className="text-lg font-bold">${total.toFixed(2)}</span>
          </div>

          <Button
            type="submit"
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Complete Order"}
          </Button>
        </div>
      </form>
    </motion.div>
  );
};

export default GuestCheckoutForm;
