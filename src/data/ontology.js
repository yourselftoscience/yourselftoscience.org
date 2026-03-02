// src/data/ontology.js

export const dataTypesOntology = [
    {
        id: "eb87d5dc-6d2c-4b5c-bba7-1422da6fb7ea",
        title: "Blood",
        slug: "blood",
        description: "Biological samples consisting of blood, including whole blood, serum, or plasma, typically used for biomarker analysis, genetic testing, and disease research."
    },
    {
        id: "c8c4e138-b4b3-4696-bad4-54c375c3d22b",
        title: "Body",
        slug: "body",
        description: "Whole body donation after death for medical research, education, and anatomical study."
    },
    {
        id: "70d22c92-acbc-4f7f-855c-023a17f2db88",
        title: "Clinical trials",
        slug: "clinical-trials",
        description: "Participation in research studies that explore whether a medical strategy, treatment, or device is safe and effective for humans."
    },
    {
        id: "f694db09-66c3-4d72-bc32-b7e1ce8eabb6",
        title: "Conversational AI data",
        slug: "conversational-ai-data",
        description: "Transcripts, audio recordings, or logs of interactions with artificial intelligence systems, used to train and improve natural language processing models."
    },
    {
        id: "5fe25208-4170-4ccb-8e10-384f58bd1c8f",
        title: "Cover letters",
        slug: "cover-letters",
        description: "Textual data from application cover letters, often used in natural language processing research, bias detection, and employment studies."
    },
    {
        id: "eaadd85f-3d6d-49d7-ae23-a1789c6258f4",
        title: "Eggs",
        slug: "eggs",
        description: "Human oocytes (eggs) donated for fertility research, stem cell creation, or developmental biology studies."
    },
    {
        id: "b218cd06-d70d-4581-9b16-8f3e1b10860c",
        title: "Embryos",
        slug: "embryos",
        description: "Human embryos donated for scientific research, typically for stem cell derivation or studies on early human development."
    },
    {
        id: "46f8fb0f-f4c3-4c9c-8597-90977a45952c",
        title: "Genome",
        slug: "genome",
        description: "Complete set of DNA sequences from an individual, including all genes, used for broad genetic research, ancestry mapping, and personalized medicine."
    },
    {
        id: "df3486df-20ce-4389-8071-85b4f62fdff4",
        title: "Hair",
        slug: "hair",
        description: "Hair samples used for toxicology, forensic analysis, trace mineral testing, or genetic research."
    },
    {
        id: "276b009f-6e86-424a-ae98-212dcbb54dfc",
        title: "Health data",
        slug: "health-data",
        description: "General electronic health records, self-reported medical history, symptom tracking, or clinical data."
    },
    {
        id: "9fdfffbf-7bd3-4f51-b847-a87071bceba0",
        title: "Location history",
        slug: "location-history",
        description: "Geospatial data tracking an individual's movements over time, often collected via smartphones, used in epidemiological studies and urban planning."
    },
    {
        id: "ce756ec5-236b-4e89-a78e-0f738012643a",
        title: "Microbiome",
        slug: "microbiome",
        description: "Data derived from the genetic material of all the microbes - bacteria, fungi, protozoa and viruses - that live on and inside the human body."
    },
    {
        id: "6e28fe6f-43b6-4bba-9b7e-00b8e766fb9a",
        title: "Organ",
        slug: "organ",
        description: "Specific solid organs (e.g., heart, lungs, kidneys) donated after death for medical research and transplantation science."
    },
    {
        id: "9da9ff60-c9a9-4bba-b1bf-f54af467c699",
        title: "Placenta",
        slug: "placenta",
        description: "Placental tissue collected after childbirth, used for studying fetal development, maternal health, and regenerative medicine."
    },
    {
        id: "b76509f6-0684-4861-bd93-19bd6f2128aa",
        title: "Plasma",
        slug: "plasma",
        description: "The clear, yellowish fluid part of the blood that carries cells and proteins throughout the body, used in a variety of therapeutic and research contexts."
    },
    {
        id: "44410a74-d4dc-4dcd-adc9-9b7c845b4b1a",
        title: "Search history",
        slug: "search-history",
        description: "Logs of queries submitted to search engines, utilized in behavioral research, sociological studies, and algorithmic training."
    },
    {
        id: "8c3b999a-02ed-4bc8-bbcd-d4de76d8b965",
        title: "Social media data",
        slug: "social-media-data",
        description: "Public or extracted data from social media platforms, including posts, interactions, and metadata, used for sociological, linguistic, and psychological research."
    },
    {
        id: "ea91c2ce-97fc-4e42-8c10-53bc3ec36696",
        title: "Sperm",
        slug: "sperm",
        description: "Male reproductive cells donated for fertility research, developmental biology, and genetic studies."
    },
    {
        id: "849fcd0f-b4b3-46bc-a567-9d7fb894b9f2",
        title: "Stem cells",
        slug: "stem-cells",
        description: "Undifferentiated cells capable of giving rise to indefinitely more cells of the same type, used in regenerative medicine, tissue engineering, and disease modeling."
    },
    {
        id: "3e46c75c-f4b9-4f7f-8be2-8dbabb9e5f5f",
        title: "Stool",
        slug: "stool",
        description: "Fecal samples typically collected to analyze the gut microbiome, digestive health, and related systemic conditions."
    },
    {
        id: "0d94f2bb-4c8d-429f-8a03-7cbce5bb9cff",
        title: "Tissue",
        slug: "tissue",
        description: "Samples of biological tissue (e.g., skin, muscle, tumor biopsies) used for cellular research, pathology, and genetic profiling."
    },
    {
        id: "33ebae2f-6eb7-4560-afbf-3ae7930db6a5",
        title: "Wearable data",
        slug: "wearable-data",
        description: "Continuous biometric data (e.g., heart rate, sleep patterns, activity levels) collected via consumer wearable devices like smartwatches or fitness trackers."
    }
];

export function getDataTypeBySlugOrId(identifier) {
    if (!identifier) return null;
    const lowerId = identifier.toLowerCase();
    return dataTypesOntology.find(
        (dt) => dt.slug.toLowerCase() === lowerId || dt.id.toLowerCase() === lowerId
    );
}
