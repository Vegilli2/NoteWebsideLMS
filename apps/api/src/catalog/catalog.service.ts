import { Injectable } from "@nestjs/common";

@Injectable()
export class CatalogService {
  getSummary() {
    return {
      levels: ["B1", "B2"],
      packages: [
        {
          slug: "b1-intensive",
          title: "B1 Intensivpakke",
          includesTeacherHelp: true,
        },
        {
          slug: "b2-deep-dive",
          title: "B2 Fordypning",
          includesTeacherHelp: true,
        },
        {
          slug: "b1-trial",
          title: "B1 prøveperiode",
          includesTeacherHelp: false,
        },
      ],
    };
  }
}
