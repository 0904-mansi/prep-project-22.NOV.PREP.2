import { useEffect, useState } from 'react';
import './App.css';
import { useFetch } from './hooks/useFetch';
import DailyForecast from './components/DailyForecast';
import HourlyForecast from './components/HourlyForecast';
import Navbar from './components/Navbar';
import MainWeatherCard from './components/MainWeatherCard';
import Box from './components/RequiredThings/Box';
import Loader from './components/Loader';
import MapContainer from './components/Map';
import PlaylistRecommendation from './components/PlaylistRecommendation';
import Footer from './components/Footer';
import Bookmark from './components/Bookmark';
import { BookmarkProvider } from './helpers/context/bookmark';

function App() {
	const [city, setCity] = useState('New York City');
	const [degree, setDegree] = useState('metric');

	const [cWeatherUrl, setCWeatherUrl] = useState(
		`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${degree}&appid=${process.env.REACT_APP_APIKEY}`,
	);
	const [forecastUrl, setForecastUrl] = useState(
		`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${degree}&appid=${process.env.REACT_APP_APIKEY}`,
	);
	const [forecastDataGrouped, setForecastDataGrouped] = useState(null);
	const [activeWeatherCard, setActiveWeatherCard] = useState(0);
	let timer,
		timeoutVal = 1000;
	const updateUrls = (city, degree) => {
		setCWeatherUrl(
			`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${degree}&appid=${process.env.REACT_APP_APIKEY}`,
		);
		setForecastUrl(
			`https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${degree}&appid=${process.env.REACT_APP_APIKEY}`,
		);
	};
	let { data: cWeatherData, error: cWeatherError, loading: cWeatherLoading } = useFetch(cWeatherUrl);
	let { data: forecastData, error: forecastError, loading: forecastLoading } = useFetch(forecastUrl);
	console.log(cWeatherData);
	const handleKeyDown = () => {
		window.clearTimeout(timer);
	};
	const handleKeyUp = () => {
		if (city) {
			window.clearTimeout(timer);
			timer = window.setTimeout(() => {
				updateUrls(city, degree);
			}, timeoutVal);
		}
	};
	 

	// For vids
	const weather = (weatherType) => {
		switch (weatherType) {
			case 'Rain':
				return 'https://joy.videvo.net/videvo_files/video/free/2022-01/large_watermarked/211212_07_Jakarta_4k_013_preview.mp4';
			case 'Clouds':
				return 'https://joy.videvo.net/videvo_files/video/free/2019-12/large_watermarked/190915_B_01_Timelapse%20Danang_05_preview.mp4';
			case 'Snow':
				return 'https://joy.videvo.net/videvo_files/video/free/2021-01/large_watermarked/210108_01_Snowy%20Woods_4k_003_preview.mp4';
			case 'Clear':
				return 'https://joy.videvo.net/videvo_files/video/free/2019-03/large_watermarked/181015_07a_Hollywood_UHD_004_preview.mp4';
			case 'Haze':
				return 'https://joy.videvo.net/videvo_files/video/free/2019-04/large_watermarked/190408_01_Alaska_Landscapes1_09_preview.mp4';
			default:
				return 'https://joy.videvo.net/videvo_files/video/free/2019-03/large_watermarked/181015_07a_Hollywood_UHD_004_preview.mp4';
		}
	};

	const findLocation = () => {
		navigator.geolocation.getCurrentPosition((position) => {
			setCWeatherUrl(
				'https://api.openweathermap.org/data/2.5/weather?lat=' +
					position.coords.latitude +
					'&lon=' +
					position.coords.longitude +
					'&units=metric&appid=' +
					process.env.REACT_APP_APIKEY,
			);

			setForecastUrl(
				'https://api.openweathermap.org/data/2.5/forecast?lat=' +
					position.coords.latitude +
					'&lon=' +
					position.coords.longitude +
					'&units=metric&appid=' +
					process.env.REACT_APP_APIKEY,
			);
		});
	};

	useEffect(() => {
		if (navigator.geolocation) {
			findLocation();
		} else {
			alert('Geolocation is not supported by this browser.');
		}
	}, []);

	useEffect(() => {
		if (cWeatherData != null) {
			setCity(cWeatherData.name);
		}
	}, [cWeatherData]);

	useEffect(() => {
		updateUrls(city, degree);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [degree]);

	useEffect(() => {
		const groupDataByDate = () => {
			const groups = forecastData.list.reduce((groups, item) => {
				const date = item.dt_txt.split(' ')[0];
				const group = groups[date] || [];
				group.push(item);
				groups[date] = group;
				return groups;
			}, {});
			const groupArrays = Object.keys(groups).map((date) => {
				return {
					date,
					data: groups[date],
				};
			});
			setForecastDataGrouped(groupArrays);
		};
		//only when the foreCastData is not empty
		if (forecastData) {
			groupDataByDate();
		}
	}, [forecastData]);

	if (cWeatherError || forecastError) {
		return <div>Error: {cWeatherError.message || forecastError.message}</div>;
	} else if (cWeatherLoading || forecastLoading || cWeatherData == null || forecastData == null) {
		return (
			<div id="loader">
				<Loader />
			</div>
		);
	} else {
		return (
			<BookmarkProvider>
				<div className={weather(cWeatherData.main)}>
					<Navbar changeUnit={degree} setChangeUnit={setDegree} />
					<main className="main-div">
						<h2>Enter a city below 👇</h2>
						<div className="search-bar">
							<div className="search-bar-items">
								<input
									type="text"
									value={city}
									onChange={(e) => setCity(e.currentTarget.value)}
									onKeyDown={() => handleKeyDown()}
									onKeyUp={() => handleKeyUp()}
								/>
							</div>
							<div className="search-bar-items">
								<Bookmark city={city}> </Bookmark>
							</div>
						</div>

						<section id="mapAndWeathercard">
							<MainWeatherCard data={cWeatherData} changeUnit={degree} />
							<MapContainer
								setCWeatherUrl={setCWeatherUrl}
								setForecastUrl={setForecastUrl}
								coord={cWeatherData.coord}
							/>
						</section>

						<section>
							<DailyForecast
								data={forecastDataGrouped}
								setActiveWeatherCard={setActiveWeatherCard}
								activeWeatherCard={activeWeatherCard}
								changeUnit={degree}
							/>
						</section>

						<section>
							<HourlyForecast data={forecastDataGrouped[activeWeatherCard]} changeUnit={degree} />
						</section>

						<section>
							<p className="required-things-heading">SUGGESTED ITEMS 🎒</p>
							<Box itemType="things" weather={cWeatherData.weather[0].main} />
						</section>

						<section>
							<p className="required-things-heading">SUGGESTED FOOD 😋</p>
							<Box itemType="food" weather={cWeatherData.weather[0].main} />
						</section>

						<section>
							<p className="required-things-heading">SUGGESTED ACTIVITIES 🙆🏻‍♂️</p>
							<Box itemType="activities" weather={cWeatherData.weather[0].main} />
						</section>

						<section>
							<p className="required-things-heading">SUGGESTED SONGS 🎶</p>
							<PlaylistRecommendation weather={cWeatherData.weather[0].main} />
						</section>
						<div className="App">
						<Footer />
						</div>
					</main>
				</div>
			</BookmarkProvider>
		);
	}
}

export default App;
