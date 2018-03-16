Rails.application.routes.draw do

  post 'streaming/download'

  get 'sleep', to: 'sleep#time'

  resources :comments, only: [:create, :update]
  get 'users/:username', to: 'users#show'

  get 'search', to: 'search#query'

  resources :videos, except: [:update], param: :token do
    get :comments
  end
  # get 'videos/:id/comments', to: 'videos#comments'
  mount_devise_token_auth_for 'User', at: 'auth'
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
end
