import { assertEquals, assert } from 'jsr:@std/assert@1';
import {
  validateFlightParams, validateHotelParams,
  buildFlightDeepLink, buildHotelDeepLink, nightsBetween,
  normalizeFlightOffers, normalizeHotelOffers,
} from './travelpayouts.ts';

Deno.test('validateFlightParams accepts a valid round trip', () => {
  const r = validateFlightParams({ origin: 'LHR', departDate: '2099-07-10', returnDate: '2099-07-17' });
  assertEquals(r.ok, true);
});

Deno.test('validateFlightParams rejects bad IATA and past dates', () => {
  assertEquals(validateFlightParams({ origin: 'London', departDate: '2099-07-10' }).ok, false);
  assertEquals(validateFlightParams({ origin: 'LHR', departDate: '2001-01-01' }).ok, false);
  assertEquals(validateFlightParams({ origin: 'LHR', departDate: '2099-07-10', returnDate: '2099-07-01' }).ok, false);
});

Deno.test('validateHotelParams enforces date order and adults range', () => {
  assertEquals(validateHotelParams({ checkIn: '2099-07-10', checkOut: '2099-07-13', adults: 2 }).ok, true);
  assertEquals(validateHotelParams({ checkIn: '2099-07-13', checkOut: '2099-07-10', adults: 2 }).ok, false);
  assertEquals(validateHotelParams({ checkIn: '2099-07-10', checkOut: '2099-07-13', adults: 0 }).ok, false);
});

Deno.test('buildFlightDeepLink appends marker to API-provided link', () => {
  const url = buildFlightDeepLink({
    link: '/search/LHR1007DXB17071?t=abc', origin: 'LHR', destination: 'DXB',
    departDate: '2099-07-10', returnDate: '2099-07-17', marker: 'M123', currency: 'usd',
  });
  assert(url.startsWith('https://www.aviasales.com/search/LHR1007DXB17071?t=abc&marker=M123'));
});

Deno.test('buildFlightDeepLink constructs a search URL when link is absent', () => {
  const oneWay = buildFlightDeepLink({
    link: null, origin: 'JFK', destination: 'DXB',
    departDate: '2099-12-05', returnDate: null, marker: 'M123', currency: 'usd',
  });
  assert(oneWay.includes('/search/JFK0512DXB1?'));
  assert(oneWay.includes('marker=M123'));
  const round = buildFlightDeepLink({
    link: undefined, origin: 'JFK', destination: 'DXB',
    departDate: '2099-12-05', returnDate: '2099-12-12', marker: 'M123', currency: 'usd',
  });
  assert(round.includes('/search/JFK0512DXB12121?'));
});

Deno.test('buildHotelDeepLink carries all booking params and marker', () => {
  const url = buildHotelDeepLink({
    hotelId: 12345, checkIn: '2099-07-10', checkOut: '2099-07-13',
    adults: 2, currency: 'aed', marker: 'M123',
  });
  assert(url.startsWith('https://search.hotellook.com/hotels?'));
  for (const part of ['hotelId=12345', 'checkIn=2099-07-10', 'checkOut=2099-07-13', 'adults=2', 'currency=aed', 'marker=M123']) {
    assert(url.includes(part), `missing ${part}`);
  }
});

Deno.test('nightsBetween', () => {
  assertEquals(nightsBetween('2099-07-10', '2099-07-13'), 3);
});

Deno.test('normalizeFlightOffers maps API rows to the offer shape', () => {
  const offers = normalizeFlightOffers(
    [{
      origin: 'LHR', destination: 'DXB', price: 389, airline: 'EK', flight_number: '4',
      departure_at: '2099-07-10T14:30:00Z', return_at: '2099-07-17T09:00:00Z',
      transfers: 0, return_transfers: 0, duration_to: 440, link: '/search/x?t=1',
    }],
    { currency: 'usd', marker: 'M123' },
  );
  assertEquals(offers.length, 1);
  assertEquals(offers[0].price, 389);
  assertEquals(offers[0].airlineIata, 'EK');
  assertEquals(offers[0].airlineName, 'Emirates');
  assertEquals(offers[0].transfers, 0);
  assert(offers[0].deepLink.includes('marker=M123'));
});

Deno.test('normalizeHotelOffers maps API rows and builds photo + deep link', () => {
  const offers = normalizeHotelOffers(
    [{ hotelId: 777, hotelName: 'Test Palace', stars: 5, priceFrom: 900, priceAvg: 1100 }],
    { checkIn: '2099-07-10', checkOut: '2099-07-13', adults: 2, currency: 'aed', marker: 'M123' },
  );
  assertEquals(offers[0].name, 'Test Palace');
  assertEquals(offers[0].nights, 3);
  assert(offers[0].photoUrl.includes('h777_1'));
  assert(offers[0].deepLink.includes('hotelId=777'));
});
