# How to Contribute to Yourself to Science

First off, thank you for considering contributing to Yourself to Science! 🎉 This is a community-driven project, and every contribution, from a simple typo fix to a new feature suggestion, is incredibly valuable.

This document provides guidelines for contributing. We have sections tailored for different types of contributions, so please read the one that best fits your situation.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [I Just Have a Question](#i-just-have-a-question)
- [Contributing Content & Ideas (For Everyone!)](#contributing-content--ideas-for-everyone)
  - [What is a GitHub "Issue"?](#what-is-a-github-issue)
  - [How to Suggest a New Service](#how-to-suggest-a-new-service)
  - [How to Report a Bug or Suggest an Improvement](#how-to-report-a-bug-or-suggest-an-improvement)
- [Contributing Code (For Developers)](#contributing-code-for-developers)
  - [Local Development Setup](#local-development-setup)
  - [Submitting a Pull Request](#submitting-a-pull-request)

---

## Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code. Please report unacceptable behavior.

---

## I Just Have a Question

Please don't open an issue to ask a question. You'll get faster results by using the following resources:

- Join our [Reddit Community](https://www.reddit.com/r/YourselfToScience/) and post your question there.
- Reach out on [X/Twitter](https://x.com/YouToScience).

---

## Contributing Content & Ideas (For Everyone!)

This is the place for you if you're not a developer but want to help improve the content of the site. Your contributions are the lifeblood of this project!

### What is a GitHub "Issue"?

Think of an "Issue" as a task or a conversation about a specific piece of work. It's how we track everything that needs to be done. You don't need to know how to code to create or comment on an Issue. It's our project's main forum for collaboration.

You can see all the open Issues [here](https://github.com/yourselftoscience/yourselftoscience.org/issues).

### How to Suggest a New Service

This is one of the most important ways you can contribute! If you know of a service that allows people to contribute to science, we want to hear about it.

1.  **Go to the "Issues" tab** at the top of our GitHub page.
2.  **Click the "New issue" button.**
3.  **Find the "Suggest a service" template and click "Get started".**
4.  **Fill out the form** with as much information as you can. The more details you provide, the faster we can review and add the service.
5.  **Click "Submit new issue".** That's it! The team will be notified and will review your suggestion.

### Adding a New Resource (for Pull Requests)

If you prefer to contribute directly via a Pull Request, please follow these steps to ensure every resource has a stable, persistent identifier.

**Your Steps:**

1.  **Fork and Clone:** Fork the repository and clone it to your local machine.
2.  **Add Your Resource:** Open the `src/data/resources.js` file.
3.  **Copy and Edit:** Copy an existing resource object and paste it at the end of the `resources` array.
4.  **Fill in Details:** Update the `title`, `slug`, `organization`, `description`, `link`, and other relevant fields for your new resource.
5.  **Leave the `id` as a Placeholder:** For the `id` field, please use the placeholder string `id: "TBD_MAINTAINER_WILL_REPLACE"`.

**Example New Resource Entry:**
```javascript
{
  id: "TBD_MAINTAINER_WILL_REPLACE",
  slug: "my-new-awesome-service",
  title: "My New Awesome Service",
  organization: "Community Contributors",
  description: "A fantastic new service for the community.",
  link: "https://new-service.com",
  dataTypes: ["new", "awesome"],
  // ... other fields
}
```
A project maintainer will run a script to generate a unique ID and replace the placeholder before merging your pull request. This ensures there are no ID conflicts.

**Submit a Pull Request:** Commit your changes and open a pull request. A maintainer will review your submission shortly.

### How to Report a Bug or Suggest an Improvement

If you see something wrong on the site or have an idea to make it better:

1.  **Go to the "Issues" tab.**
2.  **Click the "New issue" button.**
3.  Choose either the **"Bug report"** or **"Feature request"** template.
4.  Fill in the details and submit.

---

## Contributing Code (For Developers)

We welcome contributions from developers! If you're interested in fixing a bug or adding a new feature, here's how to get started.

### Local Development Setup

1.  **Fork** the repository to your own GitHub account.
2.  **Clone** your fork to your local machine: `git clone https://github.com/YOUR_USERNAME/yourselftoscience.org.git`
3.  **Navigate** into the project directory: `cd yourselftoscience.org`
4.  **Install dependencies:** `npm install`
5.  **Run the development server:** `npm run dev`

This will start the website on `http://localhost:3000`. The `dev` command also runs a watcher script that will automatically update the PDF file when you make changes to the resources.

### Submitting a Pull Request

1.  Create a new branch for your feature or bugfix.
2.  Make your changes and commit them with a clear, descriptive message.
3.  Push your branch to your fork on GitHub.
4.  Open a **Pull Request** from your fork to the `main` branch of the `yourselftoscience/yourselftoscience.org` repository.
5.  In the Pull Request description, please link to the Issue that your code addresses (e.g., "Closes #123").
6.  The team will review your code, and once approved, it will be merged.

Thank you for helping make science more accessible! 