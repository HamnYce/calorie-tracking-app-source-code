import { BodyInfoModel } from "@/src/models/body_info/bodyInfoModel";
export class SpoonacularAPI {
  static host: string = "api.spoonacular.com";
  static apiKey: string = "REDACTED";

  static async constructUri(
    pathSegs: string[],
    queryParams: { [key: string]: string; },
  ): Promise<URL> {
    queryParams.apiKey = this.apiKey;
    const bodyInfo = await BodyInfoModel.load();
    const intolerances = bodyInfo!.intolerances;
    const cuisines = bodyInfo!.cuisines;
    const searchParams = new URLSearchParams(queryParams);
    searchParams.set(
      "intolerances",
      intolerances.map((intolerance) => intolerance.toLocaleLowerCase()).join(","),
    );
    searchParams.set("cuisine", cuisines.map((cuisine) => cuisine.toLocaleLowerCase()).join(","));
    const uri = new URL(`https://${this.host}/${pathSegs.join("/")}?` + searchParams);
    console.log("generated URI: ", uri);
    return uri;
  }
}
