import { ICandidateBase, ICandidate_LLM_Data } from "@/interfaces/ICandidate"

let BASE_URL = import.meta.env.VITE_API_BASE_URL+"/cv"

function url(path: string): string {
  return BASE_URL + path
}

export const mockCandidates : ICandidateBase[] = [
{
    "id": 10,
    "name": "Vanaroja Ragavan",
    "email": "vanarojavittal@gmail.com",
    "mobile": "+91  9159427986",
    "cv_fileid": "a1b14d5f-7502-491b-87e5-5839dabae168.docx",
    "cv_filename": "Resume Vanaroja Raghavan GW Dev (1).docx",
    "skills": [
        "Core Java",
        "Guidewire PolicyCenter",
        "SQL",
        "Gosu"
    ],
    "total_exp": 10,
    "ollama": null,
    "ollama_gen_time": null,
    "openai": {
        "candidate_name": "Vanaroja Ragavan",
        "email": "vanarojavittal@gmail.com",
        "contact_number": "+91  9159427986",
        "location": null,
        "gap_in_experience": null,
        "overall_years_experience": 10,
        "skills": [
            {
                "name": "Core Java",
                "years": 10
            },
            {
                "name": "Guidewire PolicyCenter",
                "years": 8
            },
            {
                "name": "SQL",
                "years": 10
            },
            {
                "name": "Gosu",
                "years": 8
            }
        ],
        "experiences": [
            {
                "company": "HCL",
                "role": "Technical Lead",
                "start": "May 2018",
                "end": "Present",
                "highlights": [
                    "Involved in requirement analysis, design, and development activities.",
                    "Worked on defect fixing and enhancements.",
                    "Coordinated with onsite teams and clients for queries and clarifications."
                ]
            },
            {
                "company": "Ernst & Young",
                "role": "Software Technical Lead",
                "start": "December 2016",
                "end": "April 2018",
                "highlights": [
                    "Worked on both application and integration layers of Guidewire Policy Center.",
                    "Involved in requirement analysis, design, and development activities."
                ]
            },
            {
                "company": "Cognizant Technology Solutions",
                "role": "Product Specialist – Technical",
                "start": "December 2012",
                "end": "November 2016",
                "highlights": [
                    "Involved in requirement analysis, design, and development of flexible underwriting systems."
                ]
            },
            {
                "company": "Logica Private Limited",
                "role": "IT Consultant",
                "start": "March 2011",
                "end": "November 2012",
                "highlights": []
            }
        ],
        "certifications": [
            {
                "name": "Policycenter 9.0 Configuration & Integration",
                "issuer": null,
                "year": null
            },
            {
                "name": "Claimcenter 7.0 Configuration & Integration",
                "issuer": null,
                "year": null
            }
        ],
        "ranking_score": 85,
        "ranking_reason": "Vanaroja has over 10 years of IT experience with strong expertise in Guidewire systems and a proven track record in leading technical projects. Her roles showed increasing responsibility and involvement in key project phases."
    },
    "openai_gen_time": "2026-02-13T22:36:17.230886Z",
    "create_time": "2026-02-13T22:36:04.947525Z"
},
{
    "id": 9,
    "name": "SuryaDEV SUNIL KUMAR",
    "email": "aravind.ramachandran.pillai@gmail.com",
    "mobile": "+44 - 7767991693",
    "cv_fileid": "f0442528-18ba-45bd-b56f-09d1b054a3fc.docx",
    "cv_filename": "Surya_Resume.docx",
    "skills": [
        "Guidewire",
        "Java",
        "JavaScript",
        "React",
        "MuleSoft",
        "AWS",
        "PHP",
        "Python"
    ],
    "total_exp": 11,
    "ollama": null,
    "ollama_gen_time": null,
    "openai": {
        "candidate_name": "SuryaDEV SUNIL KUMAR",
        "email": "aravind.ramachandran.pillai@gmail.com",
        "contact_number": "+44 - 7767991693",
        "location": "Sreerangam, Panayamcherry, Anchal PO , Kollam District , Kerala - 691306",
        "gap_in_experience": null,
        "overall_years_experience": 11,
        "skills": [
            {
                "name": "Guidewire",
                "years": 8
            },
            {
                "name": "Java",
                "years": 11
            },
            {
                "name": "JavaScript",
                "years": 11
            },
            {
                "name": "React",
                "years": 8
            },
            {
                "name": "MuleSoft",
                "years": 1
            },
            {
                "name": "AWS",
                "years": 1
            },
            {
                "name": "PHP",
                "years": 1
            },
            {
                "name": "Python",
                "years": 1
            }
        ],
        "experiences": [
            {
                "company": "Endava",
                "role": "Consultant",
                "start": "Aug 2022",
                "end": "Present",
                "highlights": [
                    "Currently working as a Consultant, demonstrating expertise in project management."
                ]
            },
            {
                "company": "NFUM",
                "role": "Technical Lead",
                "start": "Jan 2022",
                "end": "Aug 2022",
                "highlights": [
                    "Led technical projects focusing on React JS and Socotra."
                ]
            },
            {
                "company": "Deloitte",
                "role": "Senior Consultant",
                "start": "Oct 2021",
                "end": "Jan 2022",
                "highlights": [
                    "Provided production support as Team Lead for Farmers Insurance."
                ]
            },
            {
                "company": "PwC SDC",
                "role": "Senior Technical Lead",
                "start": "May 2017",
                "end": "Oct 2021",
                "highlights": [
                    "Led a team in Guidewire development for Grange Insurance."
                ]
            },
            {
                "company": "Cloud Connect",
                "role": "Guidewire Developer",
                "start": null,
                "end": null,
                "highlights": []
            },
            {
                "company": "IAG Insurance",
                "role": "Guidewire Developer",
                "start": null,
                "end": null,
                "highlights": []
            },
            {
                "company": "EXIN Insurance",
                "role": "Guidewire Developer",
                "start": null,
                "end": null,
                "highlights": []
            },
            {
                "company": "Capgemini",
                "role": "Software Engineer",
                "start": "Dec 2015",
                "end": "May 2017",
                "highlights": [
                    "Worked on the ICare Australian Insurance Project as a Guidewire Developer."
                ]
            },
            {
                "company": "Hello Infinity Solutions",
                "role": "Software Engineer",
                "start": "Aug 2014",
                "end": "Dec 2015",
                "highlights": [
                    "Developed school management systems using PHP and JavaScript."
                ]
            }
        ],
        "certifications": [
            {
                "name": "Guidewire",
                "issuer": null,
                "year": null
            },
            {
                "name": "MuleSoft",
                "issuer": null,
                "year": "2022"
            }
        ],
        "ranking_score": 85,
        "ranking_reason": "The candidate has 11 years of experience with a strong focus on Guidewire and Java technologies, demonstrating leadership as a Technical Lead across multiple organizations."
    },
    "openai_gen_time": "2026-02-13T22:34:32.402188Z",
    "create_time": "2026-02-13T22:34:12.821953Z"
}

] //todo--REMOVE

export const sampleData : ICandidateBase = {
    "id": 10,
    "name": "Vanaroja Ragavan",
    "email": "vanarojavittal@gmail.com",
    "mobile": "+91  9159427986",
    "cv_fileid": "a1b14d5f-7502-491b-87e5-5839dabae168.docx",
    "cv_filename": "Resume Vanaroja Raghavan GW Dev (1).docx",
    "skills": [
        "Core Java",
        "Guidewire PolicyCenter",
        "SQL",
        "Gosu"
    ],
    "total_exp": 10,
    "ollama": null,
    "ollama_gen_time": null,
    "openai": {
        "candidate_name": "Vanaroja Ragavan",
        "email": "vanarojavittal@gmail.com",
        "contact_number": "+91  9159427986",
        "location": null,
        "gap_in_experience": null,
        "overall_years_experience": 10,
        "skills": [
            {
                "name": "Core Java",
                "years": 10
            },
            {
                "name": "Guidewire PolicyCenter",
                "years": 8
            },
            {
                "name": "SQL",
                "years": 10
            },
            {
                "name": "Gosu",
                "years": 8
            }
        ],
        "experiences": [
            {
                "company": "HCL",
                "role": "Technical Lead",
                "start": "May 2018",
                "end": "Present",
                "highlights": [
                    "Involved in requirement analysis, design, and development activities.",
                    "Worked on defect fixing and enhancements.",
                    "Coordinated with onsite teams and clients for queries and clarifications."
                ]
            },
            {
                "company": "Ernst & Young",
                "role": "Software Technical Lead",
                "start": "December 2016",
                "end": "April 2018",
                "highlights": [
                    "Worked on both application and integration layers of Guidewire Policy Center.",
                    "Involved in requirement analysis, design, and development activities."
                ]
            },
            {
                "company": "Cognizant Technology Solutions",
                "role": "Product Specialist – Technical",
                "start": "December 2012",
                "end": "November 2016",
                "highlights": [
                    "Involved in requirement analysis, design, and development of flexible underwriting systems."
                ]
            },
            {
                "company": "Logica Private Limited",
                "role": "IT Consultant",
                "start": "March 2011",
                "end": "November 2012",
                "highlights": []
            }
        ],
        "certifications": [
            {
                "name": "Policycenter 9.0 Configuration & Integration",
                "issuer": null,
                "year": null
            },
            {
                "name": "Claimcenter 7.0 Configuration & Integration",
                "issuer": null,
                "year": null
            }
        ],
        "ranking_score": 85,
        "ranking_reason": "Vanaroja has over 10 years of IT experience with strong expertise in Guidewire systems and a proven track record in leading technical projects. Her roles showed increasing responsibility and involvement in key project phases."
    },
    "openai_gen_time": "2026-02-13T22:36:17.230886Z",
    "create_time": "2026-02-13T22:36:04.947525Z"
}

export async function fetchCandidates(params?: CandidateSearchParams): Promise<ICandidateBase[]> {

  const qs = new URLSearchParams();
  if (params?.skills) qs.set("skills", params.skills);
  if (params?.exp) qs.set("exp", params.exp);

  var baseurl = url("/candidate/search/")
  const _url = qs.toString() ? `${baseurl}?${qs.toString()}` : `${baseurl}`;

  const res = await fetch(
    _url,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("RESPP : ", res)
  if (!res.ok) {
    throw new Error(`fetchCandidates failed: ${res.status} ${res.statusText}`);
  }

  const resData = await res.json();
  console.log("RES ; ", resData)
  const data: ICandidateBase[] = resData
  return data;
}


type CandidateSearchParams = {
  skills?: string;
  exp?: string;
};



export async function fetchCandidate(id: string): Promise<ICandidateBase> {
  const res = await fetch(
    url("cv/search/candidate/" + id),
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  console.log("RESPP : ", res)
  if (!res.ok) {
    throw new Error(`fetchCandidates failed: ${res.status} ${res.statusText}`);
  }

  const resData = await res.json();
  console.log("RES ; ", resData)
  const data: ICandidateBase = resData
  return data;
}