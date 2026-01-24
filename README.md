# Yourself to Science

**Yourself to Science™ is an open-source project providing a comprehensive list of services that allow individuals to contribute to scientific research with their data, genome, body, and more.**

Welcome to the official repository! Whether you're a developer looking to fix a bug or a community member with a suggestion for a new service, your contribution is welcome. Please see our [**Contribution Guidelines**](CONTRIBUTING.md) to get started.

By participating in this repository and related community spaces, you agree to follow our [Code of Conduct](CODE_OF_CONDUCT.md).

**Our Core Values:**

* **Transparency:**  The entire project, from the website code to the content, is openly licensed and available on GitHub. We are committed to open development and openly licensed resources.
* **Collaboration:**  This is a community-driven project! We actively encourage contributions, suggestions for new services, and improvements to the website.  Use the "Suggest a Service" button on the website or open issues/pull requests here on GitHub.
* **Accessibility:** We strive to make contributing to science accessible to everyone.  The website is designed to be user-friendly, and  to present information in a clear and understandable way for both technical and non-technical users. Furthermore, we are committed to data reusability, making the resource list easily downloadable in formats like CSV to facilitate further analysis and use.

## Adherence to `llms.txt` Standard

To make our content more accessible and understandable for Large Language Models (LLMs) and other automated systems, this project adheres to the [`llms.txt` standard](https://llmstxt.org/).

* **`public/llms.txt`**: This file provides a structured, machine-readable overview of the website's key pages, data files, and licenses.
* **Markdown Versions**: We automatically generate `.md` versions of our key pages (Homepage, Stats, etc.) to provide clean, content-focused versions for AI to process. These are linked in our `llms.txt` file and are generated via a script in the `scripts/` directory.

This approach ensures that our content can be more easily ingested, understood, and utilized by AI-powered applications, aligning with our goal of maximum accessibility and transparency.

## A Quick Guide to Our Files

For those who are not developers, navigating a code repository can sometimes be confusing. Here's a quick guide to some of our most important files:

* **`src/app/icon.svg`**: This is the main logo for the entire Yourself to Science project. Although named `icon.svg`, it functions as our primary logo. We use this specific name and location because it allows the Next.js framework to automatically handle all favicon and icon variations for different devices and platforms, which is a modern best practice.
* **`public/llms.txt`**: A file that helps Large Language Models understand the structure and content of the website. See the section above for more details.
* **`src/data/resources.js`**: This file contains the raw data for all the services and resources listed on the website. If you are suggesting changes or additions, this is where the data lives.
* **`CONTRIBUTING.md`**: The most important file for anyone who wants to help! It contains detailed instructions on how to suggest new services, report issues, or contribute code.
* **`CODE_OF_CONDUCT.md`**: The rules for how we expect people to behave in Yourself to Science spaces.

## Support the Project

This project is community-supported. If you'd like to support our work, you can do so via GitHub Sponsors or Polar:
[**Sponsor on GitHub**](https://github.com/sponsors/yourselftoscience) or [**Support on Polar**](https://buy.polar.sh/polar_cl_lA99AchQEcjUGKPRr1QxQ2gbcED7rjUBgWVby2vIGU0)

Representing a company, non-profit, university, or public institution? Please [contact us](mailto:hello@yourselftoscience.org) for partnership opportunities.

## LICENSE

The content of this project itself is licensed under the Creative Commons Attribution-ShareAlike 4.0 International License (CC BY-SA 4.0), and the underlying source code used to format and display that content is licensed under the GNU Affero General Public License (AGPL-3.0).
