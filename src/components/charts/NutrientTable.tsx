import { DataTable } from "react-native-paper";
import { NutrientInfo } from "@/src/models/food/foodInformationModel";
export default function NutrientTable({
  nutrients,
  nutrientUnitMultiplier,
}: {
  nutrients: Map<string, NutrientInfo>;
  nutrientUnitMultiplier: number;
}) {
  const nutrientEntries = [...nutrients.entries()].filter(
    (entry) => entry[0] != "Net Carbohydrates",
  );
  nutrientEntries.sort();
  const macros = ["Carbohydrates", "Fat", "Protein", "Calories"];

  function createRow([name, info]: [string, NutrientInfo]) {
    const scaledAmount = info.amount * nutrientUnitMultiplier;
    if (scaledAmount < 0.01) return null;

    return (
      <DataTable.Row key={name} style={{ height: "auto" }}>
        <DataTable.Cell>{name}</DataTable.Cell>
        <DataTable.Cell>{scaledAmount >= 0.01 ? scaledAmount.toFixed(2) : "--"}</DataTable.Cell>
        <DataTable.Cell style={{ flex: 0.25 }}>{info.unit}</DataTable.Cell>
      </DataTable.Row>
    );
  }

  return (
    <DataTable>
      <DataTable.Header>
        <DataTable.Title>Macros</DataTable.Title>
        <DataTable.Title>Amount</DataTable.Title>
        <DataTable.Title style={{ flex: 0.25 }}>Unit</DataTable.Title>
      </DataTable.Header>
      {nutrientEntries.filter((entry) => macros.includes(entry[0])).map(createRow)}

      <DataTable.Header>
        <DataTable.Title sortDirection="ascending">Micros</DataTable.Title>
        <DataTable.Title>Amount</DataTable.Title>
        <DataTable.Title style={{ flex: 0.25 }}>Unit</DataTable.Title>
      </DataTable.Header>

      {nutrientEntries.filter((entry) => !macros.includes(entry[0])).map(createRow)}
    </DataTable>
  );
}
