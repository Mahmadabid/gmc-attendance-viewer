"use client";

import { useState } from "react";
import { ArrowUturnLeftIcon, ExclamationTriangleIcon } from "@heroicons/react/16/solid";
import { SimpleSpinner } from "@/components/Spinner";
import Link from "next/link";
import { useIsOnline } from "@/components/lib/context/IsOnlineContext";

const FORM_URL = process.env.NEXT_PUBLIC_FORM_URL || '';

// Type for form state
const fieldKeys = [
  "entry.268937218",
  "entry.1059000083",
  "entry.896585087",
  "entry.1290015986"
] as const;
type FieldKey = typeof fieldKeys[number];

const FIELDS = [
  { entry: "entry.268937218", label: "Full Name", type: "text", required: true },
  { entry: "entry.1059000083", label: "Email Address", type: "email", required: true },
  {
    entry: "entry.896585087", label: "Reason for Contacting Us", type: "select", required: true, options: [
      "General Query",
      "Report a Bug",
      "Request a Feature",
      "Other"
    ]
  },
  { entry: "entry.1290015986", label: "Your Message", type: "textarea", required: true },
] as const;

export default function ContactPageClient() {
  const [form, setForm] = useState<Record<FieldKey, string>>({
    "entry.268937218": "",
    "entry.1059000083": "",
    "entry.896585087": "General Query",
    "entry.1290015986": "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const isOnline = useIsOnline();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);
    try {
      const formData = new FormData();
      for (const field of FIELDS) {
        formData.append(field.entry, form[field.entry as FieldKey]);
      }
      await fetch(FORM_URL, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });
      setSuccess(true);
      setForm({
        "entry.268937218": "",
        "entry.1059000083": "",
        "entry.896585087": "General Query",
        "entry.1290015986": "",
      });
    } catch {
      setError("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-[400px]:px-1 px-2 mt-5 min-h-[30vh]">
      <div className="flex items-center mb-8">
        <Link
          href="/"
          className="px-4 flex flex-row justify-center items-center gap-1 py-2 rounded bg-accent text-white font-semibold transition-colors hover:bg-secondary/80"
        >
          <ArrowUturnLeftIcon className="w-5 h-5" /> Home
        </Link>
      </div>
      {!isOnline && (
        <div className="flex justify-center items-center mx-2 text-red-700 bg-red-100 border border-red-300 rounded p-2 w-full mb-6 font-semibold">
          <ExclamationTriangleIcon className="min-w-6 w-6 h-6 min-h-6 text-red-700 mr-2" />
          You are Offline. Please check your internet connection.
        </div>
      )}
      <h1 className="text-2xl text-secondary font-bold mb-4">Contact Us</h1>
      <form
        className="flex flex-col gap-6 w-full max-w-xl bg-white p-6 rounded-lg border border-secondary/30 shadow-md"
        onSubmit={handleSubmit}
      >
        {FIELDS.map(field => (
          <div key={field.entry} className="flex flex-col gap-1">
            <label htmlFor={field.entry} className="text-foreground font-medium">
              {field.label}
              {field.required && <span className="text-danger">*</span>}
            </label>
            {field.type === "select" ? (
              <select
                id={field.entry}
                name={field.entry}
                value={form[field.entry as FieldKey]}
                onChange={handleChange}
                required={field.required}
                className="px-3 py-2 border border-secondary/40 rounded bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              >
                {(field.options ?? []).map(opt => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : field.type === "textarea" ? (
              <textarea
                id={field.entry}
                name={field.entry}
                value={form[field.entry as FieldKey]}
                onChange={handleChange}
                required={field.required}
                rows={4}
                className="px-3 py-2 border border-secondary/40 rounded bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent resize-y"
              />
            ) : (
              <input
                id={field.entry}
                name={field.entry}
                type={field.type}
                value={form[field.entry as FieldKey]}
                onChange={handleChange}
                required={field.required}
                className="px-3 py-2 border border-secondary/40 rounded bg-white text-primary focus:outline-none focus:ring-2 focus:ring-accent"
              />
            )}
          </div>
        ))}
        {success && (
          <div className="text-green-800 bg-green-100 rounded p-2 text-sm font-medium border border-green-200">
            Thank you! Your message has been sent.
          </div>
        )}
        {error && (
          <div className="text-red-800 bg-red-100 rounded p-2 text-sm font-medium border border-red-200">
            {error}
          </div>
        )}
        <button
          type="submit"
          className="px-5 py-2 mt-3 disabled:bg-gray-300 rounded bg-primary text-white font-semibold hover:bg-secondary transition-colors shadow-sm flex items-center justify-center"
          disabled={!isOnline || loading}
        >
          {loading ? <SimpleSpinner /> : "Send Message"}
        </button>
      </form>
    </div>
  );
}
