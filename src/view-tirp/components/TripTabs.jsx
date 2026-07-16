import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import PlacesToVisit from './PlacesToVisit'
import Hotels from './Hotels'
import RestaurantRecommendations from './RestaurantRecommendations'

function TripTabs({ trip, extras, extrasLoading, extrasError }) {
  return (
    <Tabs defaultValue="itinerary">
      <TabsList>
        <TabsTrigger value="itinerary">Itinerary</TabsTrigger>
        <TabsTrigger value="hotels">Hotels</TabsTrigger>
        <TabsTrigger value="restaurants">Restaurants</TabsTrigger>
      </TabsList>
      <TabsContent value="itinerary">
        <PlacesToVisit trip={trip} />
      </TabsContent>
      <TabsContent value="hotels">
        <Hotels trip={trip} />
      </TabsContent>
      <TabsContent value="restaurants">
        <RestaurantRecommendations trip={trip} extras={extras} extrasLoading={extrasLoading} extrasError={extrasError} />
      </TabsContent>
    </Tabs>
  )
}

export default TripTabs
