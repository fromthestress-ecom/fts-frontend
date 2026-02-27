"use client";

import { useState } from "react";

export function ContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [sent, setSent] = useState(false);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // TODO: wire up real API
    setSent(true);
    setForm({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  }

  if (sent) {
    return (
      <div className="contact-form-success">
        <svg
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
        <h2>Tin nhắn đã được gửi!</h2>
        <p>Chúng tôi sẽ phản hồi bạn sớm nhất có thể.</p>
        <button
          onClick={() => setSent(false)}
          className="contact-submit-btn"
          style={{ marginTop: "1rem" }}
        >
          Gửi tin nhắn khác
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="contact-form-row">
        <div className="contact-form-field">
          <label htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder="Nguyen"
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="contact-form-field">
          <label htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder="Van A"
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="contact-form-field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder="example@gmail.com"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="contact-form-field">
          <label htmlFor="phone">Phone No</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder="+84 xxx xxx xxx"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="contact-form-field contact-form-field--full">
        <label htmlFor="subject">Subject</label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder="Enquiry ..."
          value={form.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="contact-form-field contact-form-field--full">
        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder="Enter message here..."
          value={form.message}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="contact-submit-btn">
        Send Message
      </button>
    </form>
  );
}
