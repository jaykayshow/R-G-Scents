"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, Mail, Phone, MapPin, Clock } from "lucide-react";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Eyebrow } from "@/components/ui/typography";
import { faqs } from "@/lib/mock-data/misc";
import { useToastStore } from "@/lib/store/toast-store";

const schema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.string().email("Enter a valid email address."),
  category: z.string().min(1, "Please select a category."),
  message: z.string().min(10, "Please provide more detail (at least 10 characters)."),
});
type FormValues = z.infer<typeof schema>;

export default function ContactPage() {
  const showToast = useToastStore((s) => s.show);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitSuccessful },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  function onSubmit(values: FormValues) {
    console.log("Contact form submission", values);
    showToast("Message sent — our team will respond within 24 hours.");
    reset();
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="mb-14 text-center">
        <Eyebrow>Get in Touch</Eyebrow>
        <h1 className="mt-3 font-serif text-4xl font-semibold text-fg">We&apos;d Love to Hear From You</h1>
      </div>

      <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
        <div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" error={errors.name?.message} {...register("name")} />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" error={errors.email?.message} {...register("email")} />
              </div>
            </div>
            <div>
              <Label htmlFor="category">Subject</Label>
              <Select id="category" defaultValue="" error={errors.category?.message} {...register("category")}>
                <option value="" disabled>Select a subject</option>
                <option value="Order Support">Order Support</option>
                <option value="Product Question">Product Question</option>
                <option value="Wholesale">Wholesale / Partnerships</option>
                <option value="Press">Press &amp; Media</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" error={errors.message?.message} {...register("message")} />
            </div>
            <Button type="submit" className="w-full sm:w-auto">Send Message</Button>
            {isSubmitSuccessful && (
              <p className="text-xs text-gold">Thank you — we&apos;ve received your message.</p>
            )}
          </form>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <a href="https://wa.me/2348030001122" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md border border-overlay/10 p-4 text-sm text-overlay/70 hover:border-gold hover:text-gold">
              <MessageCircle size={18} className="text-gold" /> WhatsApp Chat
            </a>
            <a href="mailto:concierge@rgscents.com" className="flex items-center gap-3 rounded-md border border-overlay/10 p-4 text-sm text-overlay/70 hover:border-gold hover:text-gold">
              <Mail size={18} className="text-gold" /> Email Us
            </a>
            <a href="tel:+2348030001122" className="flex items-center gap-3 rounded-md border border-overlay/10 p-4 text-sm text-overlay/70 hover:border-gold hover:text-gold">
              <Phone size={18} className="text-gold" /> Call Us
            </a>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-md border border-overlay/10 p-4 text-sm text-overlay/60">
            <Clock size={18} className="shrink-0 text-gold" />
            <span>Monday – Saturday, 9:00 AM – 7:00 PM (WAT). Closed Sundays &amp; public holidays.</span>
          </div>
        </div>

        <div>
          <div className="overflow-hidden rounded-md border border-overlay/10">
            <iframe
              title="R&G Scents Showroom Location"
              src="https://maps.google.com/maps?q=Victoria%20Island%2C%20Lagos%2C%20Nigeria&t=&z=13&ie=UTF8&iwloc=&output=embed"
              width="100%"
              height="320"
              style={{ border: 0, filter: "grayscale(1) invert(0.9) contrast(0.9)" }}
              loading="lazy"
            />
          </div>
          <div className="mt-4 flex items-start gap-3 text-sm text-overlay/60">
            <MapPin size={16} className="mt-0.5 shrink-0 text-gold" />
            <span>R&amp;G Scents Showroom, Victoria Island, Lagos, Nigeria</span>
          </div>
        </div>
      </div>

      <div className="mt-20">
        <Eyebrow className="block text-center">FAQ</Eyebrow>
        <h2 className="mt-3 mb-8 text-center font-serif text-3xl text-fg">Frequently Asked Questions</h2>
        <div className="mx-auto max-w-3xl">
          <Accordion items={faqs} />
        </div>
      </div>
    </div>
  );
}
