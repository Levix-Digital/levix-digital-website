---
title: Backend Functions
summary: Cloud Functions for the contact form and the shared translation cache.
code: [functions]
---

# Backend Functions

Cloud Functions for the contact form and the shared translation cache.

## Responsibilities

Owns the server side: the `contact` endpoint and the `translate` endpoint, their Firestore collections and security rules. Does not own pages.

## Structure

`functions/src/contact.ts`, `functions/src/translate.ts`, `firestore.rules`, `firebase.json` (hosting targets and functions).

## Behavior

`contact` validates the form, checks App Check and a rate limit, stores the message in `contactMessages`, and sends the notification to contact@levix.digital through the Trigger Email extension; the message is kept even if the email fails. `translate` accepts a language and a set of English strings that exist in the source, returns cached translations from `translations/{language}/strings/{hash}`, translates the missing ones with the Cloud Translation API and stores them. Firestore denies all client access.

## Interfaces

Called by the sites over HTTPS. Calls the Cloud Translation API and the email extension.

## Decisions

- [ADR-0003](../adr/0003-firebase-hosting-with-one-site-per-domain.md): Firebase Hosting, Functions and Firestore.
- [ADR-0004](../adr/0004-build-time-and-on-demand-translation-without-per-language-ur.md): the shared translation cache.
