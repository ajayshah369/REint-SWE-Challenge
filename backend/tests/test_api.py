import unittest

import httpx
from fastapi.testclient import TestClient

from index import app, get_elexon_service
from services.elexon import ElexonService


class WindApiTests(unittest.TestCase):
    def request(self, url, handler):
        with TestClient(app) as client:
            with httpx.Client():
                async_client = httpx.AsyncClient(transport=httpx.MockTransport(handler))
                app.dependency_overrides[get_elexon_service] = lambda: ElexonService(async_client)
                try:
                    return client.get(url)
                finally:
                    app.dependency_overrides.clear()

    def test_validation(self):
        def unexpected(request):
            self.fail("Invalid input must not call Elexon")
        for query in ("", "?date=wrong", "?date=2026-02-30", "?date=2026-01-01T00:00:00Z",
                      "?date=2026-01-01&other=1", "?date=9999-12-31"):
            with self.subTest(query=query):
                self.assertEqual(self.request('/api/wind' + query, unexpected).status_code, 422)

    def test_upstream_parameters_and_filtering(self):
        calls = []
        def upstream(request):
            calls.append(request)
            if 'WINDFOR' in request.url.path:
                self.assertEqual(request.url.params['publishDateTimeFrom'], '2026-01-01T00:00:00+00:00')
                return httpx.Response(200, json=[
                    dict(dataset='WINDFOR', publishTime='2026-01-01T09:30:00Z',
                         startTime=target, generation=18000)
                    for target in ['2026-01-01T09:00:00Z', '2026-01-02T09:00:00Z', '2026-01-03T00:00:00Z']
                ])
            self.assertEqual(dict(request.url.params), dict(
                settlementDateFrom='2026-01-02', settlementDateTo='2026-01-02', fuelType='WIND'))
            return httpx.Response(200, json=[dict(
                dataset='FUELHH', publishTime='2026-01-02T09:45:00Z', startTime='2026-01-02T09:00:00Z',
                settlementDate='2026-01-02', settlementPeriod=19, fuelType='WIND', generation=17500)])
        response = self.request('/api/wind?date=2026-01-01', upstream)
        self.assertEqual(response.status_code, 200, response.text)
        self.assertEqual(len(calls), 2)
        self.assertEqual(response.json()['delivery_date'], '2026-01-02')
        self.assertEqual(len(response.json()['forecasts']), 1)
        self.assertEqual(len(response.json()['actuals']), 1)

    def test_errors(self):
        def timeout(request):
            raise httpx.ReadTimeout('timeout', request=request)
        self.assertEqual(self.request('/api/wind?date=2026-01-01', timeout).status_code, 504)
        for upstream in (
            lambda request: httpx.Response(429),
            lambda request: httpx.Response(200, json={'unexpected': 'shape'}),
        ):
            self.assertEqual(self.request('/api/wind?date=2026-01-01', upstream).status_code, 502)

    def test_empty_data_and_month_boundary(self):
        response = self.request('/api/wind?date=2026-01-31', lambda request: httpx.Response(200, json=[]))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['delivery_date'], '2026-02-01')
        self.assertEqual(response.json()['actuals'], [])


if __name__ == '__main__':
    unittest.main()
