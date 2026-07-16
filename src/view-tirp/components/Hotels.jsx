import HotelCardItem from './HotelCardItem'

function Hotels({ trip }) {
    return (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
            {trip?.tripData?.hotel_options?.map((hotel) => (
                <HotelCardItem hotel={hotel} key={`${hotel?.name}-${hotel?.address}`} />
            ))}
        </div>
    )
}

export default Hotels
