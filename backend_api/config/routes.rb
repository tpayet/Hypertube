Rails.application.routes.draw do

  post 'streaming/download'

  get 'sleep', to: 'sleep#time'

  resources :comments, only: [:create, :update]
  get 'users/:username', to: 'users#show'
  get 'users/:username/avatar', to: 'users#avatar'

  get 'search', to: 'search#query'

  resources :videos, except: [:update], param: :token do
    get :comments
    get :perform
  end

  mount_devise_token_auth_for 'User', at: 'auth', controllers: {
    omniauth_callbacks: 'overrides/omniauth_callbacks'
  }
end
