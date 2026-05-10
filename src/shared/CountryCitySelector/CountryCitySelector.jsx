'use client';

import { useState, useEffect, useRef } from 'react';
import { useFormikContext } from 'formik';
import {
  getAllCountries,
  getCitiesByCountry,
} from '@/services/api/country/country';
import s from './CountryCitySelector.module.scss';

export default function CountryCitySelector({
  countryName = 'country',
  cityName = 'city',
  label,
}) {
  const { values, setFieldValue, errors, touched } = useFormikContext();

  const [countries, setCountries] = useState([]);
  const [cities, setCities] = useState([]);
  const [citySearch, setCitySearch] = useState('');
  const [loadingCities, setLoadingCities] = useState(false);

  const [countryOpen, setCountryOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [countrySearch, setCountrySearch] = useState('');

  const countryRef = useRef(null);
  const cityRef = useRef(null);

  useEffect(() => {
    getAllCountries().then(setCountries).catch(console.error);
  }, []);

  useEffect(() => {
    const selected = countries.find((c) => c.name === values[countryName]);
    if (!selected) {
      setCities([]);
      return;
    }
    setLoadingCities(true);
    getCitiesByCountry(selected.isoCode)
      .then(setCities)
      .catch(console.error)
      .finally(() => setLoadingCities(false));
  }, [values[countryName], countries]);

  // Закрываем дропдаун при клике вне
  useEffect(() => {
    const handler = (e) => {
      if (countryRef.current && !countryRef.current.contains(e.target))
        setCountryOpen(false);
      if (cityRef.current && !cityRef.current.contains(e.target))
        setCityOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filteredCountries = countries.filter((c) =>
    c.name.toLowerCase().startsWith(countrySearch.toLowerCase())
  );

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().startsWith(citySearch.toLowerCase())
  );

  const selectCountry = (country) => {
    setFieldValue(countryName, country.name);
    setFieldValue(cityName, '');
    setCitySearch('');
    setCountrySearch('');
    setCountryOpen(false);
  };

  const selectCity = (city) => {
    setFieldValue(cityName, city.name);
    setCitySearch('');
    setCityOpen(false);
  };

  const hasCountryError = touched[countryName] && errors[countryName];
  const hasCityError = touched[cityName] && errors[cityName];

  return (
    <div className={s.wrap}>
      {/* COUNTRY */}
      <div className={s.field} ref={countryRef}>
        <label className={s.label}>Страна</label>
        <div
          className={`${s.select} ${hasCountryError ? s.error : ''}`}
          onClick={() => setCountryOpen((p) => !p)}
        >
          <span className={values[countryName] ? s.value : s.placeholder}>
            {values[countryName] || 'Выберите страну'}
          </span>
          <span className={`${s.arrow} ${countryOpen ? s.arrowUp : ''}`}>
            ▾
          </span>
        </div>

        {countryOpen && (
          <div className={s.dropdown}>
            <input
              className={s.search}
              placeholder="Поиск..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <ul className={s.list}>
              {filteredCountries.length === 0 && (
                <li className={s.empty}>Ничего не найдено</li>
              )}
              {filteredCountries.map((c) => (
                <li
                  key={c.isoCode}
                  className={`${s.item} ${values[countryName] === c.name ? s.active : ''}`}
                  onClick={() => selectCountry(c)}
                >
                  {c.flag && <span className={s.flag}>{c.flag}</span>}
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasCountryError && <p className={s.errorMsg}>{errors[countryName]}</p>}
      </div>

      {/* CITY */}
      <div className={s.field} ref={cityRef}>
        <label className={s.label}>Город</label>
        <div
          className={`${s.select} ${!values[countryName] ? s.disabled : ''} ${hasCityError ? s.error : ''}`}
          onClick={() => values[countryName] && setCityOpen((p) => !p)}
        >
          <span className={values[cityName] ? s.value : s.placeholder}>
            {loadingCities
              ? 'Загрузка...'
              : values[cityName] || 'Выберите город'}
          </span>
          <span className={`${s.arrow} ${cityOpen ? s.arrowUp : ''}`}>▾</span>
        </div>

        {cityOpen && !loadingCities && (
          <div className={s.dropdown}>
            <input
              className={s.search}
              placeholder="Поиск..."
              value={citySearch}
              onChange={(e) => setCitySearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              autoFocus
            />
            <ul className={s.list}>
              {filteredCities.length === 0 && (
                <li className={s.empty}>Ничего не найдено</li>
              )}
              {filteredCities.map((c, i) => (
                <li
                  key={i}
                  className={`${s.item} ${values[cityName] === c.name ? s.active : ''}`}
                  onClick={() => selectCity(c)}
                >
                  {c.name}
                </li>
              ))}
            </ul>
          </div>
        )}
        {hasCityError && <p className={s.errorMsg}>{errors[cityName]}</p>}
      </div>
    </div>
  );
}
