
layout(location=20) uniform int nb_emissives;
layout(location=21) uniform int NB_BOUNCES;


vec3 sample_hemisphere()
{
    // Algorithme d'échantillonnage uniforme de l'hémisphère
	float Z = random_float();
	float beta = acos(2 * Z - 1) / 2;
	float alpha = radians(random_float() * 360);
	
	return normalize(vec3(sin(beta) * cos(alpha), sin(beta) * sin(alpha), cos(beta)));
}

vec3 random_ray(in vec3 D)
{
    // Algorithme d'orientation de l'échantillon
	vec3 W;
	do {

		W = normalize(random_vec3());

	} while(abs(dot(W, D)) == 0.0);


	vec3 U = normalize(cross(D, W));
	vec3 V = normalize(cross(U, D));
	mat3 M = mat3(U, V, D); // Matrice de changement de repère 3x3

    return normalize(M * sample_hemisphere());
}


vec3 random_path(in vec3 D, in vec3 O)
{
	vec3 total = vec3(0);
    float attenu = 1.0;
	int i;
	for(i=0; i<NB_BOUNCES; ++i){
		traverse_all_bvh(O,D);
		
		if(!hit()){
			return total + attenu * mix (vec3(0.1,0.1,0.2),vec3(0.7,0.4,0.7),max(0.0,(0.5+D.z)/1.5));
		}


		vec3 N;
        vec3 P;
        intersection_info(N,P);
		N = normalize(N);
        vec4 color = intersection_color_info();
        vec4 mat = intersection_mat_info();
		vec3 local = color.rgb;
		total += local * attenu;
		if(mat.b > 0.0)
			return total * mat.b;
		attenu *=  0.3 + 0.9*max(0.0,dot(D,N)); 
		O = P+BIAS*N;
		D = random_ray(N);
	}

	return total * 0.1;
		

}

vec3 raytrace(in vec3 Dir, in vec3 Orig)   
{
	// init de la graine du random
	srand();
	// calcul de la lumière captée par un chemin aléatoire
	return random_path(normalize(Dir),Orig);
}

