import { IngredientAPI } from "@/src/apis/spoonacular/ingredientAPI";
import PartialFoodTile from "@/src/components/food/PartialFoodTile";
import { PartialFoodModel } from "@/src/models/food/partialFoodModel";
import { useEffect, useState } from "react";
import { View, ScrollView } from "react-native";
import {
  ActivityIndicator,
  Appbar,
  PaperProvider,
  Searchbar,
  SegmentedButtons,
} from "react-native-paper";
import { router, useLocalSearchParams } from "expo-router";
import { ProductAPI } from "@/src/apis/spoonacular/productAPI";
import { theme } from "@/src/constants/theme/theme";
import { FoodType } from "@/src/models/food/foodModel";

const MAX_SEARCH_AMOUNT = 10;
export default function Search() {
  const params = useLocalSearchParams<{
    cachedSearchQuery?: string;
    cachedResults: string;
  }>();

  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<PartialFoodModel[]>([]);
  const [foodTypeFilters, setfoodTypeFilters] = useState<string[]>(["ingredient", "product"]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (params.cachedSearchQuery) {
      setSearchQuery(params.cachedSearchQuery);
    }
    if (params.cachedResults) {
      const resultsPromise = params.cachedResults.split(",").map(async (idType) => {
        const [id, type] = idType.split(":");
        return PartialFoodModel.load({ id: parseInt(id), type: type as FoodType });
      });
      Promise.all(resultsPromise).then((results) => setResults(results));
    }
  }, []);

  return (
    <PaperProvider theme={theme}>
      <View style={{ flex: 1 }}>
        <Appbar.Header statusBarHeight={0}>
          <Appbar.BackAction onPress={() => router.back()} />
          <Appbar.Content title="Search" />
        </Appbar.Header>
        <View style={{ padding: 20 }}>
          <Searchbar
            placeholder="Search"
            onChangeText={setSearchQuery}
            value={searchQuery}
            onSubmitEditing={() => {
              setLoading(true);
              search({ searchQuery, filters: foodTypeFilters }).then((partialFoodModels) => {
                setResults(partialFoodModels);
                router.setParams({
                  cachedSearchQuery: searchQuery,
                  cachedResults: partialFoodModels
                    .map((model) => `${model.id}:${model.type}`)
                    .join(","),
                });
                setLoading(false);
              });
            }}
          />
          <SegmentedButtons
            multiSelect
            style={{ marginTop: 10 }}
            value={foodTypeFilters}
            onValueChange={setfoodTypeFilters}
            buttons={[
              {
                value: "ingredient",
                label: "Ingredient",
              },
              {
                value: "product",
                label: "Brand",
              },
            ]}
          />
        </View>

        <ScrollView style={{ flex: 1, padding: 20 }}>
          {loading ? (
            <ActivityIndicator />
          ) : (
            results.map((result, index) => (
              <View key={index}>
                <PartialFoodTile partialFoodModel={result} />
                <View style={{ marginTop: 20 }} />
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </PaperProvider>
  );
}

async function search({ searchQuery, filters }: { searchQuery: string; filters: string[] }) {
  if (filters.length == 0) {
    filters.push("ingredient", "product");
  }
  const searchResults: PartialFoodModel[] = [];
  const maxSearchAmount = Math.floor(MAX_SEARCH_AMOUNT / filters.length);
  if (filters.includes("ingredient")) {
    const ingredients = await IngredientAPI.search({
      query: searchQuery,
      amount: maxSearchAmount,
    });

    searchResults.push(...ingredients);
  }
  if (filters.includes("product")) {
    const products = await ProductAPI.search({
      query: searchQuery,
      amount: maxSearchAmount,
    });
    searchResults.push(...products);
  }
  return searchResults;
}
