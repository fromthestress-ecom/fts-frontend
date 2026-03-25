"use client";

import { useState } from "react";
import { useTranslations } from 'next-intl';

export function ContactForm() {
  const t = useTranslations('contact');
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
        <h2>{t('successTitle')}</h2>
        <p>{t('successDesc')}</p>
        <button
          onClick={() => setSent(false)}
          className="contact-submit-btn"
          style={{ marginTop: "1rem" }}
        >
          {t('sendAnother')}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="contact-form-row">
        <div className="contact-form-field">
          <label htmlFor="firstName">{t('firstName')}</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            placeholder={t('firstNamePlaceholder')}
            value={form.firstName}
            onChange={handleChange}
            required
          />
        </div>
        <div className="contact-form-field">
          <label htmlFor="lastName">{t('lastName')}</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            placeholder={t('lastNamePlaceholder')}
            value={form.lastName}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="contact-form-row">
        <div className="contact-form-field">
          <label htmlFor="email">{t('email')}</label>
          <input
            id="email"
            name="email"
            type="email"
            placeholder={t('emailPlaceholder')}
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>
        <div className="contact-form-field">
          <label htmlFor="phone">{t('phone')}</label>
          <input
            id="phone"
            name="phone"
            type="tel"
            placeholder={t('phonePlaceholder')}
            value={form.phone}
            onChange={handleChange}
          />
        </div>
      </div>

      <div className="contact-form-field contact-form-field--full">
        <label htmlFor="subject">{t('subject')}</label>
        <input
          id="subject"
          name="subject"
          type="text"
          placeholder={t('subjectPlaceholder')}
          value={form.subject}
          onChange={handleChange}
          required
        />
      </div>

      <div className="contact-form-field contact-form-field--full">
        <label htmlFor="message">{t('message')}</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          placeholder={t('messagePlaceholder')}
          value={form.message}
          onChange={handleChange}
          required
        />
      </div>

      <button type="submit" className="contact-submit-btn">
        {t('submitButton')}
      </button>
    </form>
  );
}
