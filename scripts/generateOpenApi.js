import { writeFileSync } from 'fs';
import { join } from 'path';

const outputPath = join(process.cwd(), 'public/openapi.json');

const openApiSchema = {
  "openapi": "3.1.0",
  "info": {
    "title": "Yourself to Science - Dataset and Agent API",
    "description": "Yourself to Science™ is an open-source project providing a comprehensive list of services that allow individuals to contribute to scientific research with their biological and digital selves. All public interfaces are read-only and require no authentication.",
    "version": "1.1.0",
    "contact": {
      "url": "https://yourselftoscience.org",
      "email": "hello@yourselftoscience.org"
    },
    "license": {
      "name": "CC0 1.0 Universal",
      "url": "https://creativecommons.org/publicdomain/zero/1.0/"
    }
  },
  "servers": [
    {
      "url": "https://yourselftoscience.org"
    }
  ],
  "paths": {
    "/api/health": {
      "get": {
        "summary": "Check public service health",
        "description": "Returns the availability and canonical machine-interface URLs for Yourself to Science.",
        "operationId": "getHealth",
        "responses": {
          "200": {
            "description": "Service is available",
            "content": {
              "application/json": {
                "schema": {
                  "type": "object",
                  "required": ["status", "service", "website", "dataset", "mcp"],
                  "properties": {
                    "status": { "type": "string", "const": "ok" },
                    "service": { "type": "string" },
                    "website": { "type": "string", "format": "uri" },
                    "dataset": { "type": "string", "format": "uri" },
                    "mcp": { "type": "string", "format": "uri" }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/a2a": {
      "get": {
        "summary": "Get A2A endpoint metadata",
        "description": "Returns the supported A2A protocol version, binding, method, and Agent Card URL.",
        "operationId": "getA2aMetadata",
        "responses": {
          "200": {
            "description": "A2A endpoint metadata",
            "content": {
              "application/json": {
                "schema": { "type": "object" }
              }
            }
          }
        }
      },
      "post": {
        "summary": "Search or retrieve catalogue resources through A2A",
        "description": "Accepts an A2A 1.0 JSON-RPC SendMessage request. Text parts perform ranked catalogue search; a data part may provide idOrSlug or structured filters.",
        "operationId": "sendA2aMessage",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["jsonrpc", "id", "method", "params"],
                "properties": {
                  "jsonrpc": { "type": "string", "const": "2.0" },
                  "id": { "oneOf": [{ "type": "string" }, { "type": "integer" }] },
                  "method": { "type": "string", "const": "SendMessage" },
                  "params": {
                    "type": "object",
                    "required": ["message"],
                    "properties": {
                      "message": {
                        "type": "object",
                        "required": ["role", "parts", "messageId"],
                        "properties": {
                          "role": { "type": "string", "const": "ROLE_USER" },
                          "messageId": { "type": "string" },
                          "parts": {
                            "type": "array",
                            "minItems": 1,
                            "items": {
                              "type": "object",
                              "properties": {
                                "text": { "type": "string" },
                                "data": { "type": "object", "additionalProperties": true }
                              },
                              "anyOf": [
                                { "required": ["text"] },
                                { "required": ["data"] }
                              ]
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        "responses": {
          "200": {
            "description": "A2A SendMessage response containing a message and structured catalogue data",
            "content": {
              "application/json": {
                "schema": { "type": "object" }
              }
            }
          },
          "400": {
            "description": "Invalid JSON-RPC or A2A request",
            "content": {
              "application/json": {
                "schema": { "type": "object" }
              }
            }
          }
        }
      }
    },
    "/resources.json": {
      "get": {
        "summary": "Get full resources dataset (JSON)",
        "description": "Returns the complete catalogue of citizen science resources as a JSON array. Each resource includes structured metadata such as data types, countries, organizations with Wikidata QIDs and ROR IDs, compensation type, and citations.",
        "operationId": "getResourcesJson",
        "responses": {
          "200": {
            "description": "Successful retrieval of all scientific and health resources",
            "content": {
              "application/json": {
                "schema": {
                  "type": "array",
                  "items": {
                    "$ref": "#/components/schemas/Resource"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/resources.csv": {
      "get": {
        "summary": "Get full resources dataset (CSV)",
        "description": "Returns the complete catalogue as a CSV spreadsheet. Suitable for importing into R, Python pandas, Excel, or Google Sheets.",
        "operationId": "getResourcesCsv",
        "responses": {
          "200": {
            "description": "CSV dataset of all resources",
            "content": {
              "text/csv": {
                "schema": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "/resources.ttl": {
      "get": {
        "summary": "Get full resources dataset (RDF/Turtle)",
        "description": "Returns the complete catalogue as RDF/Turtle linked data with schema.org vocabulary, Wikidata entity references, and ROR identifiers.",
        "operationId": "getResourcesTtl",
        "responses": {
          "200": {
            "description": "RDF/Turtle dataset of all resources",
            "content": {
              "text/turtle": {
                "schema": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "/ontology.json": {
      "get": {
        "summary": "Get the data types ontology",
        "description": "Returns definitions for all biological, digital, and clinical data types tracked in the catalogue, including Wikidata QIDs and semantic descriptions.",
        "operationId": "getOntology",
        "responses": {
          "200": {
            "description": "Data types ontology",
            "content": {
              "application/json": {
                "schema": { "type": "array" }
              }
            }
          }
        }
      }
    },
    "/void.ttl": {
      "get": {
        "summary": "Get VoID dataset description",
        "description": "Returns the VoID (Vocabulary of Interlinked Datasets) descriptor for the catalogue, including data dumps, SPARQL endpoint, and provenance metadata.",
        "operationId": "getVoid",
        "responses": {
          "200": {
            "description": "VoID dataset description in Turtle format",
            "content": {
              "text/turtle": {
                "schema": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "/datapackage.json": {
      "get": {
        "summary": "Get Frictionless Data Package descriptor",
        "description": "Returns the Frictionless Data Package (datapackage.json) metadata for the catalogue, including CSV field schemas and resource listings.",
        "operationId": "getDataPackage",
        "responses": {
          "200": {
            "description": "Frictionless Data Package descriptor",
            "content": {
              "application/json": {
                "schema": { "type": "object" }
              }
            }
          }
        }
      }
    },
    "/llms.txt": {
      "get": {
        "summary": "Get LLM context file (summary)",
        "description": "Returns a concise overview of the catalogue optimized for LLM ingestion, with instructions for AI agents and links to structured data endpoints.",
        "operationId": "getLlmsTxt",
        "responses": {
          "200": {
            "description": "LLM-optimized summary text",
            "content": {
              "text/plain": {
                "schema": { "type": "string" }
              }
            }
          }
        }
      }
    },
    "/llms-full.txt": {
      "get": {
        "summary": "Get LLM context file (full dataset)",
        "description": "Returns the full catalogue in plain-text markdown, with all resource descriptions, organizations, data types, and metrics. Optimized for LLM context windows.",
        "operationId": "getLlmsFullTxt",
        "responses": {
          "200": {
            "description": "Full plain-text dataset for LLM ingestion",
            "content": {
              "text/plain": {
                "schema": { "type": "string" }
              }
            }
          }
        }
      }
    }
  },
  "components": {
    "schemas": {
      "Resource": {
        "type": "object",
        "properties": {
          "id": { "type": "string" },
          "slug": { "type": "string" },
          "title": { "type": "string" },
          "description": { "type": "string" },
          "link": { "type": "string", "format": "uri" },
          "dataTypes": {
            "type": "array",
            "items": { "type": "string" }
          },
          "countries": {
            "type": "array",
            "items": { "type": "string" }
          },
          "locations": {
            "type": "array",
            "items": { "type": "string" }
          },
          "origin": { "type": "string" },
          "originCode": { "type": ["string", "null"] },
          "compensationType": { "type": "string" },
          "entityCategory": { "type": "string" },
          "entitySubType": { "type": "string" },
          "resourceWikidataId": { "type": ["string", "null"] },
          "entitySubTypeWikidataId": { "type": ["string", "null"] },
          "yearLaunched": { "type": ["string", "null"] },
          "isActivelyRecruiting": { "type": ["boolean", "null"] },
          "hasApi": { "type": ["boolean", "null"] },
          "isOpenData": { "type": ["boolean", "null"] },
          "compatibleSources": {
            "type": "array",
            "items": { "type": "string" }
          },
          "excludedCountries": {
            "type": "array",
            "items": { "type": "string" }
          },
          "organizations": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "name": { "type": "string" },
                "wikidataId": { "type": ["string", "null"] },
                "rorId": { "type": ["string", "null"] },
                "rorName": { "type": ["string", "null"] },
                "rorTypes": {
                  "type": "array",
                  "items": { "type": "string" }
                },
                "rorCountry": { "type": ["string", "null"] },
                "rorCity": { "type": ["string", "null"] },
                "rorEstablished": { "type": ["string", "null"] },
                "rorAutoMatched": { "type": "boolean" }
              }
            }
          },
          "citations": {
            "type": "array",
            "items": {
              "type": "object",
              "properties": {
                "title": { "type": "string" },
                "link": { "type": "string", "format": "uri" },
                "wikidataId": { "type": ["string", "null"] }
              }
            }
          },
          "instructions": {
            "type": "array",
            "items": { "type": "string" }
          },
          "macroCategories": {
            "type": "array",
            "items": { "type": "string" }
          },
          "dataTypeMappings": {
            "type": "object",
            "additionalProperties": { "type": ["string", "null"] }
          },
          "countryMappings": {
            "type": "object",
            "additionalProperties": { "type": ["string", "null"] }
          },
          "compensationWikidataId": {
            "type": ["string", "array", "null"],
            "items": { "type": "string" }
          },
          "permalink": { "type": ["string", "null"] },
          "isCitedOnWikidata": { "type": "boolean" },
          "wikidataReferenceUrl": { "type": ["string", "null"], "format": "uri" }
        }
      }
    }
  }
};

try {
  writeFileSync(outputPath, JSON.stringify(openApiSchema, null, 2), 'utf8');
  console.log('Successfully generated public/openapi.json');
} catch (error) {
  console.error('Error generating openapi.json:', error);
  process.exit(1);
}
