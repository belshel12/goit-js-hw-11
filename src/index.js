import axios from 'axios';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { cardTemplate } from './gallery-markup';

const refs = {
  form: document.querySelector('.search-form'),
  gallery: document.querySelector('.gallery'),
  guard: document.querySelector('.js-guard'),
};

const options = {
  root: null,
  rootMargin: '270px',
  threshold: 1.0,
};

const observer = new IntersectionObserver(onInfinityLoad, options);
let page = 1;
let searchQuery = '';

refs.form.addEventListener('submit', onSearch);

function onSearch(e) {
  e.preventDefault();
  searchQuery = e.target.elements.searchQuery.value;

  if (e) {
    refs.gallery.innerHTML = '';
    fetchGallery(searchQuery, (page = 1));
  }
}

async function fetchGallery(searchValue) {
  const KEY = '32980017-bfe9b13623cd5fda61d70a35c';
  const BASE_URL = 'https://pixabay.com/api/';
  const parameters = 'image_type=photo&orientation=horizontal&safesearch=true';
  const response = await axios.get(
    `${BASE_URL}?key=${KEY}&q=${searchValue}&${parameters}&per_page=40&page=${page}`
  );
  console.log(response);

  try {
    if (response.data.totalHits === 0 || searchQuery === '') {
      Notiflix.Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
    } else {
      createCardMarkup(response.data.hits);

      if (page === 1) {
        Notiflix.Notify.success(
          `Hooray! We found ${response.data.totalHits} images.`
        );
        observer.observe(refs.guard);
      }
    }
  } catch (error) {
    console.error(error);
  }
}

async function createCardMarkup(arr) {
  const markup = await arr.map(element => cardTemplate(element)).join('');
  refs.gallery.insertAdjacentHTML('beforeend', markup);
  lightbox.refresh();
}

let lightbox = new SimpleLightbox('.gallery a', {
  captionDelay: 250,
});

function onInfinityLoad(entries, observer) {
  searchQuery = refs.form.elements.searchQuery.value;

  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      fetchGallery(searchQuery, page);

      if (page === 13) {
        observer.unobserve(refs.guard);
        Notiflix.Notify.failure(
          "We're sorry, but you've reached the end of search results."
        );
      }
    }
  });
}
