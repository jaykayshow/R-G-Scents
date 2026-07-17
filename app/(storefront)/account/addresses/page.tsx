"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Plus, Star, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { Modal } from "@/components/ui/modal";
import { useAddressesStore } from "@/lib/store/addresses-store";
import { useToastStore } from "@/lib/store/toast-store";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  label: z.string().min(1, "Label is required."),
  fullName: z.string().min(1, "Full name is required."),
  line1: z.string().min(1, "Address is required."),
  line2: z.string().optional(),
  city: z.string().min(1, "City is required."),
  state: z.string().min(1, "State is required."),
  country: z.string().min(1, "Country is required."),
  postalCode: z.string().min(1, "Postal code is required."),
  phone: z.string().min(7, "Enter a valid phone number."),
});
type FormValues = z.infer<typeof schema>;

function errorMessage(err: unknown) {
  return err instanceof ApiError ? err.message : "Something went wrong. Please try again.";
}

export default function AddressesPage() {
  const addresses = useAddressesStore((s) => s.addresses);
  const loading = useAddressesStore((s) => s.loading);
  const fetchAddresses = useAddressesStore((s) => s.fetchAddresses);
  const addAddress = useAddressesStore((s) => s.addAddress);
  const removeAddress = useAddressesStore((s) => s.removeAddress);
  const setDefault = useAddressesStore((s) => s.setDefault);
  const [modalOpen, setModalOpen] = useState(false);
  const showToast = useToastStore((s) => s.show);

  useEffect(() => {
    fetchAddresses();
  }, [fetchAddresses]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    try {
      await addAddress(values);
      showToast("Address added.");
      reset();
      setModalOpen(false);
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleSetDefault(id: string) {
    try {
      await setDefault(id);
      showToast("Default address updated.");
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  async function handleRemove(id: string) {
    try {
      await removeAddress(id);
      showToast("Address removed.", "info");
    } catch (err) {
      showToast(errorMessage(err), "error");
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="font-serif text-xl text-fg">Saved Addresses</h2>
        <Button size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={14} /> Add Address
        </Button>
      </div>

      {addresses.length === 0 ? (
        <Card className="p-8 text-center text-sm text-overlay/50">
          {loading ? "Loading addresses…" : "No saved addresses yet."}
        </Card>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address.id} className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-gold" />
                  <span className="text-sm font-semibold text-fg">{address.label}</span>
                </div>
                {address.isDefault && (
                  <span className="flex items-center gap-1 text-[10px] uppercase tracking-widest text-gold">
                    <Star size={11} className="fill-gold" /> Default
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-overlay/70">
                {address.fullName}<br />
                {address.line1}{address.line2 ? `, ${address.line2}` : ""}<br />
                {address.city}, {address.state}, {address.country}<br />
                {address.postalCode}<br />
                {address.phone}
              </p>
              <div className="mt-4 flex gap-3">
                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-xs text-gold hover:underline"
                  >
                    Set as Default
                  </button>
                )}
                <button
                  onClick={() => handleRemove(address.id)}
                  className="flex items-center gap-1 text-xs text-overlay/40 hover:text-red-300"
                >
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} className="relative z-10 w-full max-w-lg overflow-y-auto rounded-md border border-overlay/10 bg-surface p-8">
        <h3 className="mb-6 font-serif text-xl text-fg">Add New Address</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="label">Label</Label>
              <Input id="label" placeholder="Home" error={errors.label?.message} {...register("label")} />
            </div>
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input id="fullName" placeholder="Rita Green" error={errors.fullName?.message} {...register("fullName")} />
            </div>
          </div>
          <div>
            <Label htmlFor="line1">Address Line 1</Label>
            <Input id="line1" error={errors.line1?.message} {...register("line1")} />
          </div>
          <div>
            <Label htmlFor="line2">Address Line 2 (Optional)</Label>
            <Input id="line2" {...register("line2")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Input id="city" error={errors.city?.message} {...register("city")} />
            </div>
            <div>
              <Label htmlFor="state">State</Label>
              <Input id="state" error={errors.state?.message} {...register("state")} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="country">Country</Label>
              <Input id="country" error={errors.country?.message} {...register("country")} />
            </div>
            <div>
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input id="postalCode" error={errors.postalCode?.message} {...register("postalCode")} />
            </div>
          </div>
          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" error={errors.phone?.message} {...register("phone")} />
          </div>
          <Button type="submit" className="w-full">Save Address</Button>
        </form>
      </Modal>
    </div>
  );
}
